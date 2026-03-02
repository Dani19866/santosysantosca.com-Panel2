import Layout from "../layout/Layout"

export default function Dashboard({ authProvider }: { authProvider?: boolean }) {
  return (
    <Layout authProvider={authProvider}>
      Dashboard
    </Layout>
  )
}