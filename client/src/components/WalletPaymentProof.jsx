
import { useState } from "react";
import { Upload, CheckCircle, LoaderCircle, X } from "lucide-react";
import "../index.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function WalletPaymentProof({ order, phone }) {
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setError("");
    setMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      e.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!transactionId.trim() || !file) {
      setError("Transaction ID and payment screenshot are required.");
      return;
    }

    const formData = new FormData();

    formData.append("order_number", order.order_number);
    formData.append("phone", phone);
    formData.append("transaction_id", transactionId.trim());
    formData.append("payment_proof", file);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders/payment-proof`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment proof submission failed.");
      }

      setSubmitted(true);
      setMessage(data.message || "Payment proof submitted successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="wallet-proof-success">
        <CheckCircle size={32} />
        <h3>Payment Proof Submitted</h3>
        <p>{message}</p>
        <span>Order: {order.order_number}</span>
        <span>Your payment is awaiting verification.</span>
      </div>
    );
  }

  return (
    <section className="wallet-proof-card">
      <div className="wallet-proof-heading">
        <Upload size={22} />
        <h3>Submit Payment Proof</h3>
        <p>
          Submit your wallet transaction details for manual verification.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="wallet-transaction-id">
          TRANSACTION ID
        </label>

        <input
          id="wallet-transaction-id"
          type="text"
          placeholder="Enter transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          maxLength={100}
          required
        />

        <label htmlFor="wallet-proof-file">
          PAYMENT SCREENSHOT
        </label>

        <div className="wallet-proof-upload">
          <input
            id="wallet-proof-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            required={!file}
          />

          {file && (
            <div className="wallet-proof-file-info">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove screenshot"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <small>JPG, PNG or WebP · Maximum 5 MB</small>
        </div>

        {error && <div className="wallet-proof-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="wallet-proof-loader" size={16} />
              SUBMITTING...
            </>
          ) : (
            "SUBMIT PAYMENT PROOF"
          )}
        </button>
      </form>
    </section>
  );
}

export default WalletPaymentProof;
