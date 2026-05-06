"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import {
  formatFirebaseError,
  getFirebaseConfigError,
  getFirestoreDb
} from "@/lib/firebase";

type Opportunity = {
  id: string;
  name: string;
  type: string;
  link: string;
  deadline: string;
  stage: string;
  sector: string;
  location: string;
  notes: string;
  created_by: string;
};

type OpportunityFormState = Omit<Opportunity, "id" | "created_by">;

const initialForm: OpportunityFormState = {
  name: "",
  type: "",
  link: "",
  deadline: "",
  stage: "",
  sector: "",
  location: "",
  notes: ""
};

export function OpportunitiesManager() {
  const { configError, user } = useAuth();
  const [form, setForm] = useState<OpportunityFormState>(initialForm);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setOpportunities([]);
      return;
    }

    const db = getFirestoreDb();

    if (!db) {
      setMessage(getFirebaseConfigError() ?? "Firestore is unavailable.");
      return;
    }

    const opportunitiesQuery = query(
      collection(db, "opportunities"),
      where("created_by", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      opportunitiesQuery,
      (snapshot) => {
        const nextItems = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Opportunity, "id">;

          return {
            id: doc.id,
            ...data
          };
        });

        setOpportunities(nextItems);
      },
      (error) => {
        setMessage(formatFirebaseError(error, "Could not load opportunities."));
      }
    );

    return unsubscribe;
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    const db = getFirestoreDb();

    if (!db) {
      setMessage(getFirebaseConfigError() ?? "Firestore is unavailable.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await addDoc(collection(db, "opportunities"), {
        ...form,
        created_by: user.uid
      });

      setForm(initialForm);
      setMessage(
        "Opportunity saved. If it disappears after reload, check your Firestore rules."
      );
    } catch (error) {
      setMessage(formatFirebaseError(error, "Could not save opportunity."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field: keyof OpportunityFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <div className="opportunities-layout">
      <section className="card card-wide">
        <div className="stack">
          <h1>Opportunities</h1>
          <p>Add and view opportunities.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Type</span>
            <input
              type="text"
              value={form.type}
              onChange={(event) => handleChange("type", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Link</span>
            <input
              type="url"
              value={form.link}
              onChange={(event) => handleChange("link", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Deadline</span>
            <input
              type="date"
              value={form.deadline}
              onChange={(event) => handleChange("deadline", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Stage</span>
            <input
              type="text"
              value={form.stage}
              onChange={(event) => handleChange("stage", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Sector</span>
            <input
              type="text"
              value={form.sector}
              onChange={(event) => handleChange("sector", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(event) => handleChange("location", event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              rows={4}
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add opportunity"}
          </button>

          <p className="message">{message}</p>
        </form>
      </section>

      <section className="card card-wide">
        <div className="stack">
          <h2>Opportunity List</h2>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Link</th>
                <th>Deadline</th>
                <th>Stage</th>
                <th>Sector</th>
                <th>Location</th>
                <th>Notes</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    {configError ?? "No opportunities yet."}
                  </td>
                </tr>
              ) : (
                opportunities.map((opportunity) => (
                  <tr key={opportunity.id}>
                    <td>{opportunity.name}</td>
                    <td>{opportunity.type}</td>
                    <td>
                      <a href={opportunity.link} target="_blank" rel="noreferrer">
                        {opportunity.link}
                      </a>
                    </td>
                    <td>{opportunity.deadline}</td>
                    <td>{opportunity.stage}</td>
                    <td>{opportunity.sector}</td>
                    <td>{opportunity.location}</td>
                    <td>{opportunity.notes}</td>
                    <td>{opportunity.created_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
