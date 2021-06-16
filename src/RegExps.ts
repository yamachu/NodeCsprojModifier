export const solutionFileRegex = new RegExp(".sln$");
export const csprojFileRegex = new RegExp(".csproj$");
export const solutionProjectRegex = new RegExp(
  /^Project\("\{[A-Z0-9]{8}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{12}\}"\) = "([^"]+)", "([^"]+)", "\{[A-Z0-9]{8}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{4}\-[A-Z0-9]{12}\}"/
);
