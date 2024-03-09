# CyBooks

Hello TAs and random internet surveillers alike, and welcome to our
work-in-progress webpage! We decided it would be nice to give people a tour of
the site so they aren't completely lost when trying to make sense of the code.

Everything is presently in the main directory; it was a requirement of the
structure we were given. Given a choice, our JSON files would likely be in a
sub-directory.

In any case, the lessons are each in their own JSON file, with `data.json`
serving as an index. The lessons that are active are presently `css-intro.json`
and `intro.json` (which may later get renamed, but that's a later problem).
Lessons are rendered in the `lesson.js` file to be displayed on the
`lesson.html` page, and the list is rendered by `index.js` to be shown in
`index.html`.

The project requirements did ask for more to be in the `data.json` file, but we
figured that modularization was more important for our scope of project. Keeping
the different data in different files made the job of displaying different
lessons significantly easier.

We hope you enjoy our page! Stay tuned for more features on the way...

## Full file list

- `404.json`: fallback lesson if any of the others are missing
- `about.html`: about page for the project and the authors, as per specification
- `css-intro.json`: lesson about CSS basics
- `data.json`: list of lessons
- `index.html`: main page, lists lessons
- `index.js`: code for `index.html`, renders the lesson list
- `intro.json`: lesson about JS basics
- `js-quirks.json`: Well... ;)
- `lesson.html`: page for holding lesson content
- `lesson.js`: code for `lesson.html`, renders the cards of a given lesson
- `style.css`: common stylesheet for all pages; adjusts the Bootstrap style and changes some accents
