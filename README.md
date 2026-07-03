# Secret to File GitHub Action

GitHub doesn't allow storing files as secrets. But files like certificates or 3rd party license files are often needed during the build process.
And instead of saving it publically in the repository, it should be stored as a secret.
This action allows storing the content of a file as a base64 secret and writing it to a file during the build process.

The content of the file has to be base64 encoded. The created file is deleted automatically at the end of the job.

## Encoding a file

macOS:

```bash
base64 -i <file> -o <file>.base64
```

Linux:

```bash
base64 <file> > <file>.base64
```

## Usage

Create a secret, e.g. like `FILE_CONTENT` in the screenshot, and add the base64 content of the file as value.

![Create secret](./docs/create-secret.png)

And use the action in your workflow:

```yaml
on: [push]

jobs:
  main:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v7
      - name: Secret to File
        id: secret
        uses: mobiledevops/secret-to-file-action@v2
        with:
          base64-encoded-secret: ${{ secrets.FILE_CONTENT }}
          filename: "hello-world.sh"
          is-executable: true
          working-directory: "./a/b/c"
      - run: ./a/b/c/hello-world.sh
      # the absolute path of the created file is also available as an output:
      - run: echo "${{ steps.secret.outputs.file-path }}"
```

## Inputs

| Input                   | Required | Default | Description                                                    |
| ----------------------- | -------- | ------- | -------------------------------------------------------------- |
| `base64-encoded-secret` | yes      | –       | Base64 encoded content for the file                            |
| `filename`              | yes      | –       | Name of the file for the content (may contain sub-directories) |
| `is-executable`         | no       | `false` | Marks the created file as executable (`chmod 755`)             |
| `working-directory`     | no       | `.`     | Folder path for the created file (created if it doesn't exist) |

## Outputs

| Output      | Description                       |
| ----------- | --------------------------------- |
| `file-path` | Absolute path of the created file |

## Notes

- Requires a runner with Node.js 24 action support (any current GitHub-hosted runner).
- The input is validated: empty or invalid base64 fails the step with a clear error instead of writing a broken file.
- `filename` must resolve to a path inside `working-directory` — values like `../escape.txt` are rejected. The `working-directory` itself is not restricted (absolute paths like `/tmp/build` are fine), since it is chosen explicitly by you.

## Development

```bash
npm install
npm run all   # lint, typecheck, test, build
```

The action runs from the committed `dist/` bundle; after changing `src/`, run `npm run build` and commit the result (CI enforces this).
