import test from "ava";
import { resolve } from "path";
import type { ProjectInfo } from "../src/Types";
import {
  getTargetFramework,
  insertTargetFrameworkSwitcherImporter,
  listing,
  switchTargetFramework,
} from "../src/Usecases";

let __context: ProjectInfo;

const SAMPLEPROJECT_JSON: ProjectInfo = {
  projectName: "SampleProject" as const,
  projectSettings: {
    targetFrameworks: ["net6.0-ios", "net6.0-android", "net6.0-maccatalyst"],
    targetFramework: undefined,
    extensionEntryAdded: false,
  },
  projectResolvedPath: "__NO_ASSERTION__",
};

const SAMPLEPROJECT_WINUI_JSON: ProjectInfo = {
  projectName: "SampleProject.WinUI" as const,
  projectSettings: {
    targetFrameworks: ["net6.0-windows10.0.19041"],
    targetFramework: undefined,
    extensionEntryAdded: false,
  },
  projectResolvedPath: "__NO_ASSERTION__",
};

test.serial("listing projects base sln", async (t) => {
  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject")
  );

  const expectedSolutionFileName = "SampleProject.sln";

  // solution file
  t.assert(solutionWithProjects.size === 1);
  t.assert([...solutionWithProjects.keys()][0], expectedSolutionFileName);

  const projects = solutionWithProjects.get(expectedSolutionFileName)!;

  t.assert(projects.length === 2);
  (() => {
    const { projectResolvedPath: _, ...actual } = projects[0];
    const { projectResolvedPath: __, ...expected } = SAMPLEPROJECT_JSON;

    t.deepEqual(actual, expected);
  })();

  (() => {
    const { projectResolvedPath: _, ...actual } = projects[1];
    const { projectResolvedPath: __, ...expected } = SAMPLEPROJECT_WINUI_JSON;

    t.deepEqual(actual, expected);
  })();

  __context = projects[0];
});

test.serial("listing projects base project", async (t) => {
  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject", "SampleProject")
  );

  const expectedSolutionFileName = ".";

  // solution file
  t.assert(solutionWithProjects.size === 1);
  t.assert([...solutionWithProjects.keys()][0], expectedSolutionFileName);

  const projects = solutionWithProjects.get(expectedSolutionFileName)!;

  t.assert(projects.length === 1);
});

test.serial("insertTargetFrameworkSwitcherImporter", async (t) => {
  await insertTargetFrameworkSwitcherImporter(__context.projectResolvedPath);

  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject")
  );

  const project = solutionWithProjects.get("SampleProject.sln")![0];

  const { projectResolvedPath: _, ...actual } = project;
  const expected = {
    ...__context,
    projectSettings: {
      ...__context.projectSettings,
      extensionEntryAdded: true,
    },
  };
  const { projectResolvedPath: __, ...expectedPartial } = expected;

  t.deepEqual(actual, expectedPartial);

  __context = expected;
});

test.serial("switchTargetFramework and getTargetFramework", async (t) => {
  const expectedTargetFramework = "net6.0-maccatalyst";
  await switchTargetFramework(
    __context.projectResolvedPath,
    expectedTargetFramework
  );

  const targetFramework = await getTargetFramework(
    __context.projectResolvedPath
  );
  t.assert(targetFramework === "net6.0-maccatalyst");
});
