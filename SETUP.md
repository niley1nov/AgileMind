Here’s a clear and organized version of the instructions:

---

### Steps to Test the Application

1. **Clone the Repository:**
   - Get the code from the GitHub repository and clone it to your local machine.

2. **Ensure Node.js is Installed:**
   - Make sure you have Node.js installed, version 20 or higher.

3. **Set Up the Server:**
   - Navigate to the `server` folder.
   - Run the following command to install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` folder by copying the contents of the `.env.example` file.
   - Update the following environment variables in the `.env` file:
     - `MONGODB_URI`
     - `JWT_SECRET_TOKEN`
     - `GEMINI_API_TOKEN`
   - Start the server by running:
     ```bash
     node index.js
     ```

4. **Set Up the Client:**
   - Navigate to the `client` folder.
   - Run the following command to install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `client` folder by copying the contents of the `.env.example` file.
   - Update the `VITE_APP_API_URL` variable in the `.env` file with the base URL of your server.

5. **Run the React Application:**
   - Start the React application by running:
     ```bash
     npm run dev
     ```

---

These steps will guide you through setting up and testing the application on your local machine.