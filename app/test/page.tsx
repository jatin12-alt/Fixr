import styles from './page.module.css'

export default function TestPage() {
  return (
    <div className={styles.testPage}>
      <h1>Fixr Test Page</h1>
      <p className={styles.success}>✅ Next.js is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <button onClick={() => alert('JavaScript is working!')}>
        Click me
      </button>
    </div>
  )
}
