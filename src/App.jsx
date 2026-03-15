import TrustWallet from './TrustWalletLogin'
import Admin from './Admin'

export default function App() {
  const path = window.location.pathname

  if (path === '/admin') {
    return <Admin />
  }

  return <TrustWallet />
}
