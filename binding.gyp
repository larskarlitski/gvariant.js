{
  "targets": [
    {
      "target_name": "glib-gvariant",
      "sources": [ "glib-gvariant.cc" ],
      "cflags": [ "<!@(pkg-config --cflags glib-2.0) -Wall" ],
      "ldflags": [  "<!@(pkg-config --libs glib-2.0)" ]
    }
  ]
}
