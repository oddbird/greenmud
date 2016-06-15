# Into The Green Green Mud

[A Novel](http://greengreenmud.com/) (with pictures)
by [Miriam Suzanne](http://miriamsuzanne.com/)

## The Project

A story of love, and after-love.
Eternity is a fickle thing,
and the moments just keep coming.
Clouds shift,
the sun moves past,
and squirrels are collecting nuts,
so where does that leave us?

_Into the Green Green Mud_
is an ode to change & impermanence,
both in content and medium.
Starting from a simple text "script"
we are creating a number of inter-related "performances"
in various media.
This version includes text, images, code, and animation,
with a soundtrack that you can download and listen to.
Future versions might include
a printed book,
a live multimedia performance,
sky writing,
or anything else we decide to explore.

- [Blog](http://miriamsuzanne.com/)
- [Videos](https://vimeo.com/album/1858141)
- [Facebook](https://www.facebook.com/greengreenmud)
- [Twitter](http://twitter.com/mirisuzanne/)
- [BWW Interview][bww]
- [RocketHub Interview][rockethub]
- [Code](https://github.com/oddbird/greenmud)

[bww]: http://www.boulderwritersworkshop.org/2012/03/28/into-the-green-mud-a-novel-with-pictures/
[rockethub]: http://blog.rockethub.com/a-new-kind-of-novel-by-eric-meyer

## Hyde Setup

To run a server
or generate the static content
you will need [Hyde](https://github.com/hyde/hyde).

It's not hard.
Install that. Install this.
Run one or two commands and you have a website.
By which I mean a book.
A digital web book that is still very much in development.

Generate the output files:

    hyde gen -r

Run a local web server:

    hyde serve [-a address] [-p port]

`hyde serve` doesn't catch and regenerate all changes to all files,
especially html includes.
If a file doesn't update,
you can try re-saving the parent (non-include) file,
or stopping the server to run `hyde gen -r`.
