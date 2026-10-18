import { Button } from './components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">RepairHub</h1>
      <p className="text-muted-foreground">Facility Maintenance Management System</p>
      <Button>Get Started</Button>
    </div>
  )
}

export default App
