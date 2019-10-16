Highsoft WebSearch
==================

The search system consists of a client component and a generator component. A
server needs to provide access to the generated keyword files only. Therefor
neither a database nor a server script is needed, which makes the search system
compatible to any cloud storage with web browser access and text file support.



Usage
=====

The following command creates a set of keyword files with weights, URLs, and
titles of inspected URLs. If keyword files already exist, it will add only new
findings.

```sh
highsoft-websearch --depth 3 --out ./keyword-directory/ https://my.website.example/
```

Afterwards you have to upload the keyword directory to a server, where it can be
accessed by web browsers. In your search site you have to include the client
component, that can be found in the keyword directory or under
`node_modules/highsoft-websearch/client/highsoft-websearch.js`.


Options
=======

There are several options to inspect multiple domains, subdomains, and offline
files.

| Option                  | Description                                                  |
|-------------------------|--------------------------------------------------------------|
| `--allowForeignDomains` | Allow foreign domains in link levels.                        |
| `--copyClient`          | Copy the client component into the output directory.         |
| `--delay [number]`      | Set the delay in milliseconds between downloads.             |
| `--depth [number]`      | Set the number of link levels to follow.                     |
| `--help`, `-h`          | Print this help text.                                        |
| `--inspectIds`          | Inspect element IDs for potential hash URLs.                 |
| `--out [directory]`     | Set the output directory for keyword files.                  |
| `--timeout [number]`    | Set the timeout in milliseconds to wait for server response. |
| `--verbose`, `-v`       | Print detailed actions for each URL and keyword file.        |
| `--version`,            | Print the version number.                                    |

Options can be also set in a JSON file called `highsoft-websearch.json` in the
current working directory.

```json
{
    "allowForeignDomains": false,
    "copyClient": true,
    "delay": 1000,
    "depth": 2,
    "inspectIds": true,
    "out": "keywords/",
    "timeout": 60000,
    "url": "https://www.domain.example/",
    "verbose": false
}
```
