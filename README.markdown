Into The Green Green Mud
========================

[A Novel](http://greengreenmud.com/) (with pictures)
by [Eric Meyer](http://eric.andmeyer.com/)

The Novel
---------

Words move, images shift and stranded characters wander through the rubble. The clouds come and go. And so on. And so on. Entropy is the passage of more than time. Sometimes people. Often ketchup. Pass the time. Pass the time. Love is only what it is, and often only a shadow of that. The sun moves from the three hand to the four and squirrels are collecting nuts, so where does that leave us? Alone and alone and alone.

The Project
-----------

Experimenting with an initial digital publication, using HTML5 and CSS3 to add interaction, responsive design and movement to the images. Followed by a short run of hard copies for people with real coffee tables.

What does a digital graphic novel look like?

Hyde
----

To see what is there, you can simply look in the "deploy" folder. To run a server or deploy yourself, you will need [Hyde](https://github.com/hyde/hyde).

It's not hard. Install that. Install this. Run one or two commands and you have a website. By which I mean a book. A digital web book that is still very much in development.

Generate the deploy files:

    hyde gen

Generate a web server:

    hyde serve [-a address] [-p port]

`hyde serve` doesn't catch and deploy all changes to all files, especially html includes. If a file doesn't update, you can try re-saving the parent (non-include) file, or stopping the server to run `hyde gen`. I recommend running `hyde gen` before committing changes, to make sure all deploy files are updated.
