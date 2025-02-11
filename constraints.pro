% @see https://github.com/yarnpkg/berry/blob/master/constraints.pro

% This rule will enforce that a workspace MUST depend on the same version of a dependency as the one used by the other workspaces
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType) :-
  % Iterates over all dependencies from all workspaces
    workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  % Iterates over similarly-named dependencies from all workspaces (again)
    workspace_has_dependency(OtherWorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType2),
  % Ignore peer dependencies
    DependencyType \= 'peerDependencies',
    DependencyType2 \= 'peerDependencies',
  % Ignore devDependencies on other workspaces
    (
      (DependencyType = 'devDependencies'; DependencyType2 = 'devDependencies') ->
        \+ workspace_ident(DependencyCwd, DependencyIdent)
      ;
        true
    ).

% This rule will prevent workspaces from depending on non-workspace versions of available workspaces
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, WorkspaceRange, DependencyType) :-
  % Iterates over all dependencies from all workspaces
    workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  % Only consider those that target something that could be a workspace
    workspace_ident(DependencyCwd, DependencyIdent),
  % Obtain the version from the dependency
    workspace_field(DependencyCwd, 'version', DependencyVersion),
  % Quirk: we must discard the workspaces that don't declare a version
    atom(DependencyVersion),
  % Only proceed if the dependency isn't satisfied by a workspace
    \+ project_workspaces_by_descriptor(DependencyIdent, DependencyRange, DependencyCwd),
  % Derive the expected range from the version
    (
      DependencyType = 'peerDependencies' ->
        atom_concat('^', DependencyVersion, WorkspaceRange)
      ;
      DependencyType = 'devDependencies' ->
        WorkspaceRange = 'workspace:*'
      ;
        atom_concat('workspace:^', DependencyVersion, WorkspaceRange)
    ).

% This rule enforces that all workspaces must depend on other workspaces using `workspace:*` in devDependencies
gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:*', 'devDependencies') :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, 'devDependencies'),
  % Only consider those that target something that could be a workspace
  workspace_ident(DependencyCwd, DependencyIdent).
