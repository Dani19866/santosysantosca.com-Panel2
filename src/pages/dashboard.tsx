import Layout from "../layout/Layout"

export default function Dashboard({ authProvider }: { authProvider?: boolean }) {
  return (
    <Layout authProvider={authProvider} showViewMode={false}>
      yo soy el dashboard mi broasdasd
    </Layout>
  )
}