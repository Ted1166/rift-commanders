import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

const Training = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/30 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="text-primary/70 hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary text-glow tracking-wider">
            TRAINING SIMULATOR
          </h1>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border border-primary/30 rounded-lg p-12">
            <p className="text-primary/70 text-lg mb-6">
              Training modules coming soon...
            </p>
            <p className="text-primary/50 text-sm">
              Practice unit deployment, combat mechanics, and tactical maneuvers in a safe environment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Training;