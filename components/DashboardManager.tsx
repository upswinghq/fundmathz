"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { getFirebaseConfigError, getFirestoreDb } from "@/lib/firebase";

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

export function DashboardManager() {
  const { configError, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    const db = getFirestoreDb();

    if (!db) {
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
    });

    return unsubscribe;
  }, [user]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = applications
      .filter((application) => {
        const deadline = new Date(`${application.deadline}T00:00:00`);

        return deadline >= today && deadline <= sevenDaysFromNow;
      })
      .sort((left, right) => left.deadline.localeCompare(right.deadline));

    return {
      upcomingDeadlines,
      counts: {
        in_progress: applications.filter((application) => application.status === "in_progress")
          .length,
        submitted: applications.filter((application) => application.status === "submitted")
          .length,
        accepted: applications.filter((application) => application.status === "accepted").length
      }
    };
  }, [applications]);

  return (
    <div className="opportunities-layout">
      <section className="card card-wide">
        <div className="stack">
          <h1>Dashboard</h1>
          <p>Application summary.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-box">
            <strong>In Progress</strong>
            <p>{summary.counts.in_progress}</p>
          </div>
          <div className="dashboard-box">
            <strong>Submitted</strong>
            <p>{summary.counts.submitted}</p>
          </div>
          <div className="dashboard-box">
            <strong>Accepted</strong>
            <p>{summary.counts.accepted}</p>
          </div>
        </div>
      </section>

      <section className="card card-wide">
        <div className="stack">
          <h2>Upcoming Deadlines</h2>
          <p>Next 7 days.</p>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Opportunity ID</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Next Action</th>
              </tr>
            </thead>
            <tbody>
              {summary.upcomingDeadlines.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    {configError ?? getFirebaseConfigError() ?? "No upcoming deadlines."}
                  </td>
                </tr>
              ) : (
                summary.upcomingDeadlines.map((application) => (
                  <tr key={application.id}>
                    <td>{application.opportunity_id}</td>
                    <td>{application.deadline}</td>
                    <td>{application.status}</td>
                    <td>{application.next_action}</td>
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
