#!/usr/bin/env node

import { execSync } from 'child_process';
import OpenAIApi from 'openai';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.join(__dirname, '.env');
config({ path: envPath });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAIApi({
    key: OPENAI_API_KEY
});

const API_MODEL = 'gpt-3.5-turbo-16k';

const MAX_TOKENS = 2048;
const AVG_TOKENS_PER_LINE = 5;
const MAX_DIFF_LINES = Math.floor(MAX_TOKENS / AVG_TOKENS_PER_LINE);

const args = process.argv.slice(2);

function getGitDiff() {
    try {
        let diff = execSync('git diff --function-context').toString().split('\n');

        if (diff.length > MAX_DIFF_LINES) {
            console.warn("Diff is too large with function context. Falling back to regular git diff.");
            diff = execSync('git diff').toString().split('\n');
        }

        // If the diff is still too large, truncate it
        if (diff.length > MAX_DIFF_LINES) {
            console.warn("Truncating large diff for brevity.");
            diff = diff.slice(0, MAX_DIFF_LINES);
        }

        return diff.join('\n');
    } catch (e) {
        console.error('Error in Git Diff: ', e);
    }
}

function getCommitHistory() {
    return execSync('git log --pretty=format:"%s"').toString().split('\n');
}

async function generatePRDescription(commitMessages) {
    const commitsAsString = commitMessages.join('\n');
    const messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant creating messages for pull requests in a software engineering team based on the provided commits messages."
        },
        {
            "role": "user",
            "content": `Generate a well-defined description in Markdown format with at least 100 words for a pull request to a Github repository with the following commit messages \`\`\`${commitsAsString}\`\`\``
        }
    ];

    const response = await openai.chat.completions.create({
        model: API_MODEL,
        messages: messages
    });
    return response.choices[0].message.content.trim();
}


async function generateCommitMessage(diff) {
    const prompt = `You are a helpful assistant creating messages for commits in a software engineering team. Based on the following diffs, provide a commit message. The first line should be a concise summary of the changes, followed by a more detailed description if necessary.\n\nDiffs:\n${diff}`;
    const response = await openai.chat.completions.create({
        model: API_MODEL,
        messages: [{
            role: "system",
            content: prompt
        }]
    });
    return response.choices[0].message.content.trim();
}

(async () => {
    if (args.includes('--cm')) {
        const diff = getGitDiff();
        // Check if the diff is empty
        if (!diff.trim()) {
            console.log("No changes detected in the repository.");
            return;
        }
        const commitMsg = await generateCommitMessage(diff);
        console.log("Suggested Commit Message:", commitMsg);
    } else if (args.includes('--prd')) {
        const commitMessages = getCommitHistory();
        const prDescription = await generatePRDescription(commitMessages);
        console.log("Suggested PR Description:", prDescription);
    } else {
        console.log("Please specify either --cm for commit message or --prd for PR description.");
    }

})();
