# Critik Frontend

Critik is a modern social platform for art enthusiasts and creators. This Angular-based frontend delivers a rich, interactive experience for exploring artworks, sharing feedback, and connecting with a community of artists.

## 🚀 Features

-   **User Authentication**: Secure login and registration.
-   **Artwork Feed**: Browse a curated or social feed of artworks.
-   **Social Interactions**: Like, comment, and share artworks.
-   **Profiles**: Customized user profiles showcasing portfolios.
-   **Search**: Find artists and artworks easily.

## 🛠 Tech Stack

-   **Framework**: [Angular 21](https://angular.io/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management/Async**: [RxJS](https://rxjs.dev/)
-   **Testing**: [Vitest](https://vitest.dev/)
-   **Styling**: Vanilla CSS with a focus on modern, responsive design.

## 🏁 Getting Started

### Prerequisites

-   **Node.js**: Ensure you have Node.js installed (v18+ recommended).
-   **npm**: Comes with Node.js.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd critik-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**

    ```bash
    ng serve
    ```

    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## 🏗 Project Structure

The project follows a modular architecture:

-   `src/app/core`: Singleton services, guards, interceptors, and models used throughout the application.
    -   `api`: Services handling HTTP requests.
    -   `auth`: Authentication logic and guards.
-   `src/app/features`: Feature modules containing components and routes for specific business domains (e.g., `artworks`, `auth`, `feed`, `profile`).
-   `src/app/shared`: Reusable components, pipes, and directives.
-   `src/app/layout`: Main layout components like header, footer, and shell.

## 📜 Scripts

-   `npm start`: Runs the app in development mode.
-   `npm run build`: Builds the app for production to the `dist/` folder.
-   `npm test`: Runs unit tests using Vitest.
-   `npm run watch`: Builds the app in watch mode.

## 🤝 Contributing

Contributions are welcome! Please follow the standard pull request workflow.

## 📄 License

[License Name] - see the [LICENSE](LICENSE) file for details.
