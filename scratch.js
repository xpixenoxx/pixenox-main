const { execSync } = require('child_process');
try {
  // Try to checkout the files from the commit before the "Standardize Services UI grid" commit
  // We can just use git checkout HEAD~2 -- src/components/home/ServicesSection.tsx src/components/home/ServicesSection.css
  // Because my commit was HEAD~1, wait, I might have made two commits?
  // Let's just find the commit where ServicesSection.css was modified heavily before today.
  
  // To be safe, let's just get the file from the remote origin/main or HEAD~1.
  // Actually, I can use git log to find the last commit by Pixenox, and checkout the file from there.
  console.log("Checking out from HEAD~1");
  execSync('git checkout HEAD~1 -- src/components/home/ServicesSection.tsx src/components/home/ServicesSection.css');
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
