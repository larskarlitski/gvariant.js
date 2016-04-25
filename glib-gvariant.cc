
#include <node.h>
#include <node_buffer.h>
#include <glib.h>

static void gvariant_free(char *data, void *hint) {
        GVariant *v = (GVariant *)hint;
        g_variant_unref(v);
}

static void parse(const v8::FunctionCallbackInfo<v8::Value> &args) {
        auto isolate = args.GetIsolate();

        if (args.Length() != 2) {
                isolate->ThrowException(v8::Exception::TypeError(
                        v8::String::NewFromUtf8(isolate, "Need two arguments (type and gvariant in text format)")));
                return;
        }

        v8::String::Utf8Value type(args[0]->ToString());
        v8::String::Utf8Value text(args[1]->ToString());

        if (!g_variant_type_string_is_valid(*type)) {
                isolate->ThrowException(v8::Exception::TypeError(
                        v8::String::NewFromUtf8(isolate, "Invalid gvariant type string")));
                return;
        }

        GError *error = NULL;
        GVariant *v = g_variant_parse(G_VARIANT_TYPE(*type), *text, NULL, NULL, &error);
        if (v == NULL) {
                isolate->ThrowException(v8::Exception::TypeError(
                        v8::String::NewFromUtf8(isolate, error->message)));
                g_error_free(error);
                return;
        }

        g_variant_ref_sink(v);

        char *data = (char *)g_variant_get_data(v);
        size_t size = g_variant_get_size(v);

        auto buf = node::Buffer::New(isolate, data, size, gvariant_free, v).ToLocalChecked();
        args.GetReturnValue().Set(buf);
}

void init(v8::Handle<v8::Object> exports) {
        NODE_SET_METHOD(exports, "parse", parse);
}

NODE_MODULE(glib_gvariant, init)
