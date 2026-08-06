# Contributing to FingerFlow Studio

First off, thank you for considering contributing to FingerFlow Studio! We welcome community input to make this the best open-source gesture drawing application on the web.

## Workflow
1. **Fork** the repo on GitHub.
2. **Clone** the project to your own machine.
3. **Branch**: Create a new branch (`git checkout -b feature/my-awesome-feature`).
4. **Develop**: Make your changes and test them using `npm run dev` and `npm run build`.
5. **Commit**: Commit your changes (`git commit -m 'feat: Add some feature'`).
6. **Push**: Push to the branch (`git push origin feature/my-awesome-feature`).
7. **Pull Request**: Open a PR back to the main FingerFlow Studio repository.

## Development Setup
Please see the [README.md](README.md) for full installation and backend setup instructions.
For an overview of the Engine Architecture, please see the [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md).

## Coding Standards
- We strictly use **TypeScript**.
- Avoid massive React renders. Bind heavy canvas logic to the `EventBus` or Engine classes.
- Comment complex math inside the `CanvasManager` or `ViewportManager`.
- Ensure new dependencies are strictly necessary.

## Reporting Bugs
If you find a bug, please use the Bug Report template under the Issues tab. Include reproducible steps and console errors.
