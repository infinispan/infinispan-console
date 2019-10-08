<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output omit-xml-declaration="yes" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
        <link rel="stylesheet" type="text/css" href="licenses.css"/>
      </head>
      <body>
        <p>
          The following material has been provided for informational purposes only,
          and should not be relied upon or construed as a legal opinion or legal advice.
        </p>

        <table>
          <tr>
            <th>Package</th>
            <th>Version</th>
            <th>Remote Licenses</th>
            <th>Local Licenses</th>
          </tr>

          <xsl:for-each select="//dependency/package/..">
            <xsl:variable name="p" select="package"/>
            <xsl:variable name="v" select="version"/>
            <tr>
              <td>
                <xsl:value-of select="$p"/>
              </td>
              <td>
                <xsl:value-of select="$v"/>
              </td>
              <td>
                <xsl:for-each select="licenses/license">
                  <xsl:variable name="n" select="name"/>
                  <xsl:variable name="url" select="url"/>
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="$url"/>
                    </xsl:attribute>
                    <xsl:value-of select="$n"/>
                  </a>
                  <br/>
                </xsl:for-each>
              </td>
              <td>
                <xsl:for-each select="licenses/license">
                  <xsl:variable name="n" select="name"/>
                  <xsl:variable name="f" select="concat(translate($n,' ','-'),'.txt')"/>
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="$f"/>
                    </xsl:attribute>
                    <xsl:value-of select="$f"/>
                  </a>
                  <br/>
                </xsl:for-each>
              </td>
            </tr>
          </xsl:for-each>

        </table>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
