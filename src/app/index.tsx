import { html, css } from "react-strict-dom"

const styles = css.create({
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
    backgroundColor: "#282c34",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 600,
    padding: 16,
  },
  h1: {
    color: "white",
  },
  p: {
    marginTop: 16,
    color: "white",
    lineHeight: 1.6,
  },
})

export default function App() {
  return (
    <html.main style={styles.main}>
      <html.div style={styles.container}>
        <html.h1 style={styles.h1}>StyleX & React Strict DOM</html.h1>
        <html.p style={styles.p}>
          This is a simple example of using StyleX with React Strict DOM.
          <html.br />
          Please read README.md for more information.
        </html.p>
      </html.div>
    </html.main>
  )
}
