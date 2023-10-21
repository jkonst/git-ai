# Git AI Commit Message & PR Description Generator

## Prerequisites
- Node.js
- An OpenAI API key

## Installation
1. Clone this repository

``` git clone [URL_OF_THIS_REPO] ```

2. Go the repository directory

``` cd [REPO_DIRECTORY_NAME] ```

3. Create a .env file in the root of the project by copying the existing .env.sample and add there your OpenAI API key:

``` OPENAI_API_KEY=your_openai_api_key ```

4. Install the plugin globally:
   - Using npm:
   ``` npm install -g . ```
   - Using yarn: 
   ``` yarn global add file:$PWD ```

## Usage
Once installed globally, you can use the git-gen command in any Git repository to generate either commit messages or PR descriptions.
### Generate a Commit Message
``` git-gen --cm ```
### Generate a PR Description
``` git-gen --prd --target-branch [YOUR_TARGET_BRANCH] ```

## How It Works
- The **--cm** option fetches the **git diff** of your repository and sends it to OpenAI's API to generate a commit message. The message starts with a concise summary of the changes, followed by a more detailed description.

- The **--prd --target-branch [YOUR_TARGET_BRANCH]** option fetches the commit history of your branch based on the commits that are unique to the current branch since it diverged from a target branch and sends it to OpenAI's API to generate a PR description in Markdown format.

## Notes
- Ensure you have set up the .env file with your OpenAI API key before running the script.
- The script uses the --function-context option with git diff to provide more context about the changes. If the diff is too large, it falls back to a regular git diff.

## Contributing
If you'd like to contribute to this project, please create a pull request with your proposed changes.
