
#include <glib.h>

int main (int argc, char **argv)
{
  g_autoptr(GVariant) v = NULL;
  g_autoptr(GError) error = NULL;
  gsize size;
  const gchar *data;

  if (argc < 2)
    {
      g_printerr ("Usage: %s GVARIANT_TEXT\n", argv[0]);
      return 1;
    }

  v = g_variant_parse (NULL, argv[1], NULL, NULL, &error);
  if (v == NULL)
    {
      g_autofree gchar *msg = NULL;

      msg = g_variant_parse_error_print_context (error, argv[1]);
      g_printerr ("%s", msg);

      return 1;
    }

  g_print ("%s\n", g_variant_get_type_string (v));

  size = g_variant_get_size (v);
  data = g_variant_get_data (v);

  if (size > 0)
    {
      g_print ("[ 0x%x", data[0]);

      for (gsize i = 1; i < size; i++)
        g_print (", 0x%x", data[i]);

      g_print (" ]\n");
    }
  else
    g_print ("[]\n");

  return 0;
}
