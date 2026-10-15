import { useState } from "react";
import { countryName } from "../../data/demo/regions";
import { useCommerce } from "../../context/CommerceContext";
import { validateAddressDraft } from "../../services/checkout/demoCheckout";
import { emptyAddress } from "../../services/customer/demoCustomer";
import type { AddressDraft, AddressKind, FieldErrors, SavedAddress } from "../../types/commerce";
import { AccountLayout } from "./AccountLayout";
import { AddressFields } from "./AddressFields";

export function AddressesPage() {
  const { addresses, saveAddress, deleteAddress } = useCommerce();
  const [editing, setEditing] = useState<AddressKind | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirming, setConfirming] = useState<AddressKind | null>(null);
  const [status, setStatus] = useState("");

  const start = (kind: AddressKind, current: SavedAddress | null) => {
    setEditing(kind);
    setDraft(current ? { ...current } : emptyAddress());
    setErrors({});
    setStatus("");
    setConfirming(null);
  };

  const onSave = () => {
    if (!editing) {
      return;
    }
    const nextErrors = validateAddressDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    saveAddress(editing, draft);
    setEditing(null);
    setStatus("Address saved.");
  };

  return (
    <AccountLayout path="/account/addresses" title="Addresses">
      {status ? (
        <p className="commerce-status" role="status">
          {status}
        </p>
      ) : null}
      <div className="address-grid">
        <AddressCard
          title="Shipping address"
          address={addresses.shipping}
          confirming={confirming === "shipping"}
          onAdd={() => start("shipping", null)}
          onEdit={() => start("shipping", addresses.shipping)}
          onAskRemove={() => setConfirming("shipping")}
          onCancelRemove={() => setConfirming(null)}
          onRemove={() => {
            deleteAddress("shipping");
            setConfirming(null);
            setStatus("Shipping address removed.");
          }}
        />
        <AddressCard
          title="Billing address"
          address={addresses.billing}
          confirming={confirming === "billing"}
          onAdd={() => start("billing", null)}
          onEdit={() => start("billing", addresses.billing)}
          onAskRemove={() => setConfirming("billing")}
          onCancelRemove={() => setConfirming(null)}
          onRemove={() => {
            deleteAddress("billing");
            setConfirming(null);
            setStatus("Billing address removed.");
          }}
        />
      </div>
      {editing ? (
        <section className="commerce-card" aria-labelledby="address-form-title">
          <h2 id="address-form-title">{editing === "shipping" ? "Shipping address" : "Billing address"}</h2>
          <AddressFields idPrefix={`account-${editing}`} value={draft} errors={errors} onChange={setDraft} />
          <div className="checkout-actions">
            <button type="button" className="btn" onClick={onSave}>
              Save address
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}
    </AccountLayout>
  );
}

function AddressCard({
  title,
  address,
  confirming,
  onAdd,
  onEdit,
  onAskRemove,
  onCancelRemove,
  onRemove,
}: {
  title: string;
  address: SavedAddress | null;
  confirming: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onAskRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="commerce-card">
      <h2>{title}</h2>
      {address ? (
        <>
          <address>
            {address.firstName} {address.lastName}
            <br />
            {address.company ? (
              <>
                {address.company}
                <br />
              </>
            ) : null}
            {address.address1}
            <br />
            {address.address2 ? (
              <>
                {address.address2}
                <br />
              </>
            ) : null}
            {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postcode}
            <br />
            {countryName(address.country)}
            {address.phone ? (
              <>
                <br />
                {address.phone}
              </>
            ) : null}
          </address>
          <div className="checkout-actions">
            <button type="button" className="btn btn-secondary" onClick={onEdit}>
              Edit
            </button>
            {confirming ? (
              <>
                <button type="button" className="btn" onClick={onRemove}>
                  Confirm remove
                </button>
                <button type="button" className="text-button" onClick={onCancelRemove}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="text-button" onClick={onAskRemove}>
                Remove
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p>No address is saved.</p>
          <button type="button" className="btn" onClick={onAdd}>
            Add address
          </button>
        </>
      )}
    </article>
  );
}
