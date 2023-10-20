#!/usr/bin/env node

import { execSync } from 'child_process';
import OpenAIApi from 'openai';
import { config } from 'dotenv';

config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAIApi({
    key: OPENAI_API_KEY
});

const MAX_TOKENS = 2048;
const AVG_TOKENS_PER_LINE = 5;
const MAX_DIFF_LINES = Math.floor(MAX_TOKENS / AVG_TOKENS_PER_LINE);

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

async function generateCommitMessage(diff) {
    const prompt = `You are a helpful assistant creating messages for commits in a software engineering team based on the diffs found on the specific branch. Here's the diff:\n${diff}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: [{
            role: "system",
            content: prompt
        }]
    });
    return response.choices[0].message.content.trim();
}

(async () => {
    const diff = getGitDiff();
    const commitMsg = await generateCommitMessage(diff);
    console.log(commitMsg);
})();
