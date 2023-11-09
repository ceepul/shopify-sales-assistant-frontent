export default function CenteredDiv({ children, minHeight = '100px' }) {
  return (
    <div style={{
      minHeight: minHeight,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {children}
    </div>
  );
}