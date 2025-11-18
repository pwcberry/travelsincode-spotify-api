# Travels In Code Experiment: Spotify API

Let's learn how to use the Web API provided by Spotify.

## Getting Started


### OpenSSL configuration

In the example below, replace the placeholders with angle brackets (`<<`, `>>`) with values relevant to your project.

```shell
######################################################
# OpenSSL config to generate a self-signed certificate
#
# Retrieved from: https://serverfault.com/questions/973446/self-signed-ssl-i-created-for-localhost-cannot-be-trusted-even-though-i-have-alr
#
######################################################

################ Req Section ################
# This is used by the `openssl req` command
# to create a certificate request and by the
# `openssl req -x509` command to create a
# self-signed certificate.

[ req ]

# The size of the keys in bits:
default_bits = 2048

# The message digest for self-signing the certificate
# sha1 or sha256 for best compatability, although most
# OpenSSL digest algorithm can be used.
# md4,md5,mdc2,rmd160,sha1,sha256
default_md   = sha256

# Don't prompt for the DN, use configured values instead
# This saves having to type in your DN each time.

prompt             = no
string_mask        = default
distinguished_name = req_dn

# Extensions added while singing with the `openssl req -x509` command
x509_extensions = x509_ext

[ req_dn ]

countryName            = AU
stateOrProvinceName    = <<Victoria>>
organizationName       = <<Example>>
commonName             = <<A General Name For The Certificate>>

[ x509_ext ]

subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always

# No basicConstraints extension is equal to CA:False
# basicConstraints      = critical, CA:False

keyUsage = critical, digitalSignature, keyEncipherment

extendedKeyUsage = serverAuth

subjectAltName = @alt_names

[alt_names]
DNS.1 = <<spotify.example.com>>
DNS.2 = <<www.example.com>>
```

When you have created your config, execute the following command:

```
openssl req -x509 -new -nodes -days 90 -keyout cert/selfsigned.key -out cert/selfsigned.pem -config openssl.cnf
```

Then you will need to add the certificate to your browser. In Chrome, you install it using the [Certificate Manager](chrome://certificate-manager/localcerts).

![Google Chrome Certificate Manager](./docs/images/chrome-cert-mgr.png)

This will help Chrome recognize your local server as a legitimate web server with a well-defined name running HTTPS.
