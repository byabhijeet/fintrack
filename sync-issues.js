const fs = require('fs');
const { execSync } = require('child_process');

// Read the markdown file
const fileContent = fs.readFileSync('doc/implementation_issues.md', 'utf8');

// Regex to match the slices. Handles both "**Description**:" and "**What to build**:" formats.
const sliceRegex = /- \[(x| )\] \*\*(Slice \d+: [^*]+)\*\*(?:[\s\S]*?- \*\*(?:Description|What to build)\*\*: ([^\n]+))/g;

let match;
console.log('Starting GitHub Issues Sync...\n');

while ((match = sliceRegex.exec(fileContent)) !== null) {
  const isCompleted = match[1] === 'x';
  const title = match[2].trim().replace(/"/g, '\\"').replace(/\$/g, '\\$');
  const description = match[3].trim().replace(/"/g, '\\"').replace(/\$/g, '\\$'); // escape quotes and bash symbols

  console.log(`\nSyncing: ${title}`);
  
  try {
    // 1. Create the issue
    // We add 'legacy' and 'jules' labels so they are categorized correctly.
    const createCmd = `gh issue create --title "${title}" --body "${description}" --label "legacy,jules"`;
    console.log(`> Running: gh issue create...`);
    
    // Capture the URL/ID returned by gh issue create
    const output = execSync(createCmd, { encoding: 'utf8' }).trim();
    console.log(`> Created: ${output}`);

    // 2. If it was already completed in the markdown, close the issue in GitHub
    if (isCompleted) {
      const issueUrl = output; 
      const closeCmd = `gh issue close ${issueUrl}`;
      console.log(`> Closing completed issue...`);
      execSync(closeCmd);
    }
  } catch (error) {
    console.error(`> ❌ Failed to sync "${title}":`, error.message);
  }
}

console.log('\n✅ Sync complete!');
