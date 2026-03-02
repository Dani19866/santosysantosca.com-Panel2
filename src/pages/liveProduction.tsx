import Layout from "../layout/Layout"

export default function LiveProduction({ authProvider }: { authProvider?: boolean }) {
  return (
    <Layout authProvider={authProvider}>
      Live Production
    </Layout>
  )
}