export default function Users() {
  return (
    <div className="container">
      <h2>Users</h2>

      <div className="card">
        <p>👤 alice</p>
        <button>Send message</button>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <p>👤 bob</p>
        <button>Send message</button>
      </div>
    </div>
  );
}