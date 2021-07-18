export const CSPROJ_PROPERTY_PropertyGroup = "PropertyGroup";
export const CSPROJ_PROPERTY_TargetFrameworks = "TargetFrameworks";
export const CSPROJ_PROPERTY_Import = "Import";
export const CSPROJ_PROPERTY_TargetFramework = "TargetFramework";

export const EXTENSION_CONFIGURE_FILE_NAME = "TargetFrameworkSwitcher.targets";
export const CSPROJ_PROPERTY_EXTENSION_CONFIGURE_FILE_NAME = `$(MSBuildProjectDirectory)\\${EXTENSION_CONFIGURE_FILE_NAME}`;

export const CSPROJ_PROPERTY_Import_Tag = `   <!-- NOTE: TargetFrameworkSwitcher inserts it, DO NOT EDIT YOURSELF and IT REQUIRES TOP-LEVEL EVALUATION BEFORE USING "TargetFramework" VARIABLE -->
    <Import Project="${CSPROJ_PROPERTY_EXTENSION_CONFIGURE_FILE_NAME}" Condition="Exists('${CSPROJ_PROPERTY_EXTENSION_CONFIGURE_FILE_NAME}')" />
`;

export const EXTENSION_CONFIGURE_FILE_TEMPLATE = (
  _strings: TemplateStringsArray,
  targetFramework: string
) => `<Project>
    <!-- NOTE: DO NOT EDIT YOURSELF
        You should add this file to gitignore
    -->
    <PropertyGroup>
        <TargetFramework>${targetFramework}</TargetFramework>
    </PropertyGroup>
</Project>`;
