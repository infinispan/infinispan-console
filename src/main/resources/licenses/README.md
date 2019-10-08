# License Info

Using this set of scripts, XSL templates, and data files, a Maven artifact containing
license information for all production dependencies is generated.

The list of dependencies (both direct and transitive) must currently be updated (mostly) manually,
and it's stored in the `./artifacts/console.txt` file.

When you add a new dependency/version, you'll also may need to modify `license-database.xml`
and add the license text into `./texts`.

The generation is driven by an *ant* script and performed using XSL transformations.
You may find useful it to perform `npm list --prod` to get the dependency list for the projects
and use `versions.sh` to grep licenses from *npmjs.com*.
