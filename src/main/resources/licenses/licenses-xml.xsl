<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output omit-xml-declaration="yes" indent="yes"/>
  <xsl:param name="license_database"/>

  <xsl:template match="/">
    <licenseSummary>
      <dependencies>

        <xsl:for-each select="//artifact/p/..">
          <xsl:variable name="p" select="p"/>
          <xsl:variable name="v" select="v"/>
          <dependency>
            <package>
              <xsl:value-of select="$p"/>
            </package>
            <version>
              <xsl:value-of select="$v"/>
            </version>
            <licenses>
              <xsl:for-each
                select="document($license_database)//artifact[p=$p]//versions[v=$v]/../../..">
                <license>
                  <name>
                    <xsl:value-of select="n"/>
                  </name>
                  <url>
                    <xsl:value-of select="url"/>
                  </url>
                </license>
              </xsl:for-each>
            </licenses>
          </dependency>
        </xsl:for-each>

      </dependencies>
    </licenseSummary>
  </xsl:template>

</xsl:stylesheet>
