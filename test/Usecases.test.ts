import anyTest, { TestInterface } from "ava";
import { copyFile, rm } from "fs/promises";
import { resolve } from "path";
import type { ProjectInfo } from "../src/Types";
import {
  getTargetFramework,
  insertTargetFrameworkSwitcherImporter,
  listing,
  switchTargetFramework,
} from "../src/Usecases";

const test = anyTest as TestInterface<{
  current: {
    project: ProjectInfo;
  };
}>;

test.after.always(async () => {
  await rm(
    resolve(
      __dirname,
      "resources",
      "SampleProject",
      "SampleProject",
      "TargetFrameworkSwitcher.targets"
    ),
    {
      force: true,
    }
  );

  await copyFile(
    resolve(
      __dirname,
      "resources",
      "SampleProject",
      "SampleProject",
      "SampleProject.csproj.template"
    ),
    resolve(
      __dirname,
      "resources",
      "SampleProject",
      "SampleProject",
      "SampleProject.csproj"
    )
  );
});

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

const MULTIPLE_TARGETFRAMEWORKS_JSON: ProjectInfo = {
  projectName: "MultipleTargetFrameworksEntriesProject",
  projectSettings: {
    targetFrameworks: [
      "net8.0-android",
      "net8.0-ios",
      "net8.0-maccatalyst",
      "$(TargetFrameworks)",
      "net8.0-windows10.0.19041.0",
    ],
    targetFramework: undefined,
    extensionEntryAdded: false,
  },
  projectResolvedPath: "__NO_ASSERTION__",
};

test.before((t) => {
  t.context = { current: { project: SAMPLEPROJECT_JSON } };
});

test.serial("listing projects base sln", async (t) => {
  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject")
  );

  const expectedSolutionFileName = "SampleProject.sln";

  // solution file
  t.assert(solutionWithProjects.size === 1);
  t.assert([...solutionWithProjects.keys()][0], expectedSolutionFileName);

  const projects = solutionWithProjects.get(expectedSolutionFileName)!;

  t.assert(projects.length === 3);
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

  t.context.current.project = projects[0];
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
  await insertTargetFrameworkSwitcherImporter(
    t.context.current.project.projectResolvedPath
  );

  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject")
  );

  const project = solutionWithProjects.get("SampleProject.sln")![0];

  const { projectResolvedPath: _, ...actual } = project;
  const expected = {
    ...t.context.current.project,
    projectSettings: {
      ...t.context.current.project.projectSettings,
      extensionEntryAdded: true,
    },
  };
  const { projectResolvedPath: __, ...expectedPartial } = expected;

  t.deepEqual(actual, expectedPartial);

  t.context.current.project = expected;
});

test.serial("switchTargetFramework and getTargetFramework", async (t) => {
  const expectedTargetFramework = "net6.0-maccatalyst";
  await switchTargetFramework(
    t.context.current.project.projectResolvedPath,
    expectedTargetFramework
  );

  const targetFramework = await getTargetFramework(
    t.context.current.project.projectResolvedPath
  );
  t.assert(targetFramework === "net6.0-maccatalyst");
});

test.serial("support multiple TargetFrameworks entries", async (t) => {
  const solutionWithProjects = await listing(
    resolve(__dirname, "resources", "SampleProject")
  );

  const expectedSolutionFileName = "SampleProject.sln";
  const projects = solutionWithProjects.get(expectedSolutionFileName)!;

  const { projectResolvedPath: _, ...actual } = projects[2];
  const { projectResolvedPath: __, ...expected } =
    MULTIPLE_TARGETFRAMEWORKS_JSON;

  t.deepEqual(actual, expected);
});
