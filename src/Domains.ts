import { parse } from "fast-xml-parser";
import {
  CSPROJ_PROPERTY_EXTENSION_CONFIGURE_FILE_NAME,
  CSPROJ_PROPERTY_Import,
  CSPROJ_PROPERTY_Import_Tag,
  CSPROJ_PROPERTY_PropertyGroup,
  CSPROJ_PROPERTY_TargetFramework,
  CSPROJ_PROPERTY_TargetFrameworks,
} from "./Constants";
import { solutionProjectRegex } from "./RegExps";
import type { Project, ProjectSettings } from "./Types";
import { detectSeparator, propertyToArrayed } from "./Utils";

export const parseCsproj = (csprojContent: string): ProjectSettings => {
  const parsed = parse(csprojContent, { ignoreAttributes: false });

  const innerProject = parsed["Project"] ?? {};
  // TargetFrameworkやTargetFrameworksは一つという前提でreduceでmergeする
  const innerPropertyGroup = propertyToArrayed(
    innerProject,
    CSPROJ_PROPERTY_PropertyGroup
  ).reduce((prev, curr) => ({
    ...prev,
    ...curr,
  }));

  const targetFrameworks = (
    innerPropertyGroup[CSPROJ_PROPERTY_TargetFrameworks] ?? ""
  ).split(";");
  const targetFramework = innerPropertyGroup[CSPROJ_PROPERTY_TargetFramework];

  const imports = propertyToArrayed(innerProject, CSPROJ_PROPERTY_Import);
  const extensionEntryAdded =
    imports.find(
      (x) => x["@_Project"] === CSPROJ_PROPERTY_EXTENSION_CONFIGURE_FILE_NAME
    ) !== undefined;

  return { targetFrameworks, targetFramework, extensionEntryAdded };
};

export const parseSolution = (fileContent: string): Array<Project> =>
  fileContent
    .split(/\r\n|\n/)
    .map((line) => solutionProjectRegex.exec(line))
    .filter((v): v is RegExpExecArray => v !== null)
    .map((x) => ({ name: x[1], relativePath: x[2] }));

export const insertTargetFrameworkSwitcherImporterToCsproj = (
  fileContent: string
): string => {
  const separator = detectSeparator(fileContent);
  return fileContent
    .split(/\r\n|\n/)
    .map((line) => {
      if (/<Project .*>/.test(line)) {
        return `${line}${separator}${CSPROJ_PROPERTY_Import_Tag}`;
      }
      return line;
    })
    .join(separator);
};

export const parseExtensionConfig = (
  fileContent: string
): string | undefined => {
  const parsed = parse(fileContent);
  const innerProject = parsed["Project"] ?? {};
  const innerPropertyGroup = propertyToArrayed(
    innerProject,
    CSPROJ_PROPERTY_PropertyGroup
  ).reduce((prev, curr) => ({
    ...prev,
    ...curr,
  }));
  const targetFramework = innerPropertyGroup[CSPROJ_PROPERTY_TargetFramework];
  return targetFramework;
};
