import React, { useState } from "react";

type School = {
    id: string;
    name: string;
    district: string;
    status: string;
};

type Team = {
    id: string;
    name: string;
    school: string;
    division: string;
};

type Student = {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    team: string;
};

type Coach = {
    id: string;
    firstName: string;
    lastName: string;
    school: string;
    email: string;
};

type Event = {
    id: string;
    title: string;
    date: string;
    location: string;
    status: string;
};

type Judge = {
    id: string;
    firstName: string;
    lastName: string;
    expertise: string;
    assignedTo: string;
};

type Request = {
    id: string;
    requestType: string;
    submittedBy: string;
    status: string;
    notes: string;
};

type TabKey = "Schools" | "Teams" | "Students" | "Coaches" | "Events" | "Judges" | "Requests";

const initialData = {
    Schools: [
        { id: "s1", name: "Lincoln High", district: "North", status: "Active" },
        { id: "s2", name: "Sunrise Prep", district: "East", status: "Pending" },
    ] as School[],
    Teams: [
        { id: "t1", name: "Photon Flyers", school: "Lincoln High", division: "A" },
        { id: "t2", name: "Circuit Breakers", school: "Sunrise Prep", division: "B" },
    ] as Team[],
    Students: [
        { id: "st1", firstName: "Ava", lastName: "Morgan", grade: "10", team: "Photon Flyers" },
        { id: "st2", firstName: "Noah", lastName: "Lee", grade: "11", team: "Circuit Breakers" },
    ] as Student[],
    Coaches: [
        { id: "c1", firstName: "Mia", lastName: "Chen", school: "Lincoln High", email: "mia.chen@example.com" },
        { id: "c2", firstName: "Liam", lastName: "Garcia", school: "Sunrise Prep", email: "liam.garcia@example.com" },
    ] as Coach[],
    Events: [
        { id: "e1", title: "Regional Qualifier", date: "2026-05-15", location: "Convention Center", status: "Scheduled" },
        { id: "e2", title: "Final Championship", date: "2026-06-20", location: "City Arena", status: "Planning" },
    ] as Event[],
    Judges: [
        { id: "j1", firstName: "Sophia", lastName: "Adams", expertise: "Robotics", assignedTo: "Photon Flyers" },
        { id: "j2", firstName: "Ethan", lastName: "Baker", expertise: "Software", assignedTo: "Circuit Breakers" },
    ] as Judge[],
    Requests: [
        { id: "r1", requestType: "Team Registration", submittedBy: "Sunrise Prep", status: "Pending", notes: "Need fast approval" },
        { id: "r2", requestType: "Event Change", submittedBy: "Lincoln High", status: "Reviewed", notes: "Schedule conflict" },
    ] as Request[],
};

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("Schools");
    const [schools, setSchools] = useState<School[]>(initialData.Schools);
    const [teams, setTeams] = useState<Team[]>(initialData.Teams);
    const [students, setStudents] = useState<Student[]>(initialData.Students);
    const [coaches, setCoaches] = useState<Coach[]>(initialData.Coaches);
    const [events, setEvents] = useState<Event[]>(initialData.Events);
    const [judges, setJudges] = useState<Judge[]>(initialData.Judges);
    const [requests, setRequests] = useState<Request[]>(initialData.Requests);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});

    const metrics = [
        { label: "Schools", value: schools.length },
        { label: "Teams", value: teams.length },
        { label: "Students", value: students.length },
        { label: "Coaches", value: coaches.length },
        { label: "Events", value: events.length },
        { label: "Judges", value: judges.length },
        { label: "Requests", value: requests.length },
    ];

    const handleTabClick = (tab: TabKey) => {
        setActiveTab(tab);
        setEditingId(null);
        setEditValues({});
    };

    const startEdit = (row: Record<string, any>) => {
        setEditingId(row.id);
        setEditValues({ ...row });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({});
    };

    const updateField = (field: string, value: string) => {
        setEditValues((current) => ({ ...current, [field]: value }));
    };

    const saveEdit = () => {
        if (!editingId) return;

        const saveRows = <T extends { id: string }>(rows: T[], setter: React.Dispatch<React.SetStateAction<T[]>>) => {
            setter(rows.map((row) => (row.id === editingId ? { ...row, ...editValues } : row)));
        };

        switch (activeTab) {
            case "Schools":
                saveRows(schools, setSchools);
                break;
            case "Teams":
                saveRows(teams, setTeams);
                break;
            case "Students":
                saveRows(students, setStudents);
                break;
            case "Coaches":
                saveRows(coaches, setCoaches);
                break;
            case "Events":
                saveRows(events, setEvents);
                break;
            case "Judges":
                saveRows(judges, setJudges);
                break;
            case "Requests":
                saveRows(requests, setRequests);
                break;
        }

        cancelEdit();
    };

    const changeRequestStatus = (id: string, status: string) => {
        setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
    };

    const renderTableHeaders = (columns: string[]) => (
        <tr>
            {columns.map((column) => (
                <th key={column} style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #ddd" }}>
                    {column}
                </th>
            ))}
            <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #ddd" }}>Actions</th>
        </tr>
    );

    const renderTableRow = (row: Record<string, any>, columns: string[]) => (
        <tr key={row.id}>
            {columns.map((column) => (
                <td key={column} style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                    {editingId === row.id ? (
                        <input
                            type="text"
                            value={editValues[column] ?? ""}
                            onChange={(e) => updateField(column, e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #ccc" }}
                        />
                    ) : (
                        row[column]
                    )}
                </td>
            ))}
            <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                {editingId === row.id ? (
                    <>
                        <button onClick={saveEdit} style={{ marginRight: 8 }}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                    </>
                ) : (
                    <button onClick={() => startEdit(row)}>Edit</button>
                )}
            </td>
        </tr>
    );

    const renderCurrentTable = () => {
        switch (activeTab) {
            case "Schools":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["name", "district", "status"])}</thead>
                        <tbody>{schools.map((school) => renderTableRow(school, ["name", "district", "status"]))}</tbody>
                    </table>
                );
            case "Teams":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["name", "school", "division"])}</thead>
                        <tbody>{teams.map((team) => renderTableRow(team, ["name", "school", "division"]))}</tbody>
                    </table>
                );
            case "Students":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["firstName", "lastName", "grade", "team"])}</thead>
                        <tbody>{students.map((student) => renderTableRow(student, ["firstName", "lastName", "grade", "team"]))}</tbody>
                    </table>
                );
            case "Coaches":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["firstName", "lastName", "school", "email"])}</thead>
                        <tbody>{coaches.map((coach) => renderTableRow(coach, ["firstName", "lastName", "school", "email"]))}</tbody>
                    </table>
                );
            case "Events":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["title", "date", "location", "status"])}</thead>
                        <tbody>{events.map((event) => renderTableRow(event, ["title", "date", "location", "status"]))}</tbody>
                    </table>
                );
            case "Judges":
                return (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>{renderTableHeaders(["firstName", "lastName", "expertise", "assignedTo"])}</thead>
                        <tbody>{judges.map((judge) => renderTableRow(judge, ["firstName", "lastName", "expertise", "assignedTo"]))}</tbody>
                    </table>
                );
            case "Requests":
                return (
                    <div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>{renderTableHeaders(["requestType", "submittedBy", "status", "notes"])}</thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id}>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{request.requestType}</td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{request.submittedBy}</td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{request.status}</td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{request.notes}</td>
                                        <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                                            <button onClick={() => changeRequestStatus(request.id, "Approved")} style={{ marginRight: 8 }}>
                                                Approve
                                            </button>
                                            <button onClick={() => changeRequestStatus(request.id, "Denied")}>Deny</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ padding: 24, fontFamily: "Arial, sans-serif", color: "#222" }}>
            <h1 style={{ marginBottom: 12 }}>Admin Dashboard</h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        style={{
                            background: "#fff",
                            border: "1px solid #e1e1e1",
                            borderRadius: 12,
                            padding: 16,
                            minWidth: 130,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{metric.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{metric.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                {(["Schools", "Teams", "Students", "Coaches", "Events", "Judges", "Requests"] as TabKey[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        style={{
                            padding: "10px 16px",
                            borderRadius: 999,
                            border: activeTab === tab ? "2px solid #3b82f6" : "1px solid #d1d5db",
                            background: activeTab === tab ? "#eff6ff" : "#fff",
                            cursor: "pointer",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 }}>
                <h2 style={{ marginTop: 0, marginBottom: 16 }}>{activeTab}</h2>
                {renderCurrentTable()}
            </div>
        </div>
    );
};

export default Dashboard;