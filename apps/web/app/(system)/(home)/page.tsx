import React from "react";
import ProjectIdeaForm from "./components/project-idea-form";

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full">
        <h1 className="mb-7 mx-auto max-w-2xl text-center text-2xl font-semibold leading-9 text-foreground px-1 text-pretty whitespace-pre-wrap">
          Describe your project idea and we'll generate tickets
        </h1>
        <ProjectIdeaForm />
      </div>
    </div>
  );
}

export default HomePage;
