"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { getFirebaseConfigError, getFirestoreDb } from "@/lib/firebase";

type Opportunity = {
  id: string;
  name: string;
};

type ApplicationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "rejected";

type Application = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  deadline: string;
  next_action: string;
  notes: string;
};

type ApplicationFormState = {
  opportunity_id: string;
  status: ApplicationStatus;
  deadline: string;
  next_action: string;
  notes: string;
};

type NotesDraftState = Record<string, string>;
type SavingState = Record<string, boolean>;

const statuses: ApplicationStatus[] = [
  "not_started",
  "in_progress",
  "submitted",
  "accepted",
  "rejected"
];

const initialForm: ApplicationFormState = {
  opportunity_id: "",
  status: "not_started",
  deadline: "",
  next_action: "",
  notes: ""
};

export function ApplicationsManager() {
  const { configError, user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [form, setForm] = useState<ApplicationFormState>(initialForm);
  const [notesDrafts, setNotesDrafts] = useState<NotesDraftState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingStatus, setSavingStatus] = useState<SavingState>({});
  const [savingNotes, setSavingNotes] = useState<SavingState>({});
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

    const unsubscribe = onSnapshot(opportunitiesQuery, (snapshot) => {
      const nextOpportunities = snapshot.docs.map((item) => {
        const data = item.data() as Omit<Opportunity, "id">;

        return {
          id: item.id,
          name: data.name
        };
      });

      setOpportunities(nextOpportunities);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    const db = getFirestoreDb();

    if (!db) {
      setMessage(getFirebaseConfigError() ?? "Firestore is unavailable.");
      return;
    }

    const applicationsQuery = query(
      collection(db, "applications"),
      where("user_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      const nextApplications = snapshot.docs.map((item) => {
        const data = item.data() as Omit<Application, "id">;

        return {
          id: item.id,
          ...data
        };
      });

      setApplications(nextApplications);
      setNotesDrafts((current) => {
        const nextDrafts = { ...current };

        nextApplications.forEach((application) => {
          if (nextDrafts[application.id] === undefined) {
            nextDrafts[application.id] = application.notes;
          }
        });

        Object.keys(nextDrafts).forEach((key) => {
          if (!nextApplications.some((application) => application.id === key)) {
            delete nextDrafts[key];
          }
        });

        return nextDrafts;
      });
    });

    return unsubscribe;
  }, [user]);

  const applicationsWithOpportunityName = useMemo(() => {
    const names = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity.name]));

    return applications.map((application) => ({
      ...application,
      opportunityName: names.get(application.opportunity_id) ?? application.opportunity_id
    }));
  }, [applications, opportunities]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
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
      await addDoc(collection(db, "applications"), {
        user_id: user.uid,
        opportunity_id: form.opportunity_id,
        status: form.status,
        deadline: form.deadline,
        next_action: form.next_action,
        notes: form.notes
      });

      setForm(initialForm);
      setMessage("Application created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    const db = getFirestoreDb();

    if (!db) {
      setMessage(getFirebaseConfigError() ?? "Firestore is unavailable.");
      return;
    }

    setSavingStatus((current) => ({
      ...current,
      [applicationId]: true
    }));

    try {
      await updateDoc(doc(db, "applications", applicationId), { status });
    } finally {
      setSavingStatus((current) => ({
        ...current,
        [applicationId]: false
      }));
    }
  }

  async function handleNotesSave(applicationId: string) {
    const db = getFirestoreDb();

    if (!db) {
      setMessage(getFirebaseConfigError() ?? "Firestore is unavailable.");
      return;
    }

    setSavingNotes((current) => ({
      ...current,
      [applicationId]: true
    }));

    try {
      await updateDoc(doc(db, "applications", applicationId), {
        notes: notesDrafts[applicationId] ?? ""
      });
    } finally {
      setSavingNotes((current) => ({
        ...current,
        [applicationId]: false
      }));
    }
  }

  return (
    <div className="opportunities-layout">
      <section className="card card-wide">
        <div className="stack">
          <h1>Applications</h1>
          <p>Create and track applications.</p>
        </div>

        <form className="form" onSubmit={handleCreate}>
          <label className="field">
            <span>Opportunity</span>
            <select
              value={form.opportunity_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  opportunity_id: event.target.value
                }))
              }
              required
            >
              <option value="">Select opportunity</option>
              {opportunities.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as ApplicationStatus
                }))
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Deadline</span>
            <input
              type="date"
              value={form.deadline}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  deadline: event.target.value
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Next Action</span>
            <input
              type="text"
              value={form.next_action}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  next_action: event.target.value
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value
                }))
              }
              rows={4}
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create application"}
          </button>

          <p className="message">{message}</p>
        </form>
      </section>

      <section className="card card-wide">
        <div className="stack">
          <h2>Application List</h2>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Next Action</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {applicationsWithOpportunityName.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    {configError ?? "No applications yet."}
                  </td>
                </tr>
              ) : (
                applicationsWithOpportunityName.map((application) => (
                  <tr key={application.id}>
                    <td>{application.opportunityName}</td>
                    <td>
                      <select
                        value={application.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            application.id,
                            event.target.value as ApplicationStatus
                          )
                        }
                        disabled={savingStatus[application.id]}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{application.deadline}</td>
                    <td>{application.next_action}</td>
                    <td>
                      <div className="cell-stack">
                        <textarea
                          value={notesDrafts[application.id] ?? ""}
                          onChange={(event) =>
                            setNotesDrafts((current) => ({
                              ...current,
                              [application.id]: event.target.value
                            }))
                          }
                          rows={3}
                        />
                        <button
                          type="button"
                          onClick={() => void handleNotesSave(application.id)}
                          disabled={savingNotes[application.id]}
                        >
                          {savingNotes[application.id] ? "Saving..." : "Save notes"}
                        </button>
                      </div>
                    </td>
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
