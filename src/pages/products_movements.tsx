import Layout from "../layout/Layout"
import { productMovementsController } from "../controllers/productMovementsController"

export default function ProductsMovements({ authProvider }: { authProvider: boolean }) {
    return (
        <Layout showViewMode={false} authProvider={authProvider}>
          Movimiento de productos
        </Layout>
      )
}