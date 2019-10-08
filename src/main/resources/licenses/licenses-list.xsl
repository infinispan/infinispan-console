<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output omit-xml-declaration="yes" indent="yes"/>

  <xsl:template match="/">

    <xsl:for-each select="//dependency/package/..">
      <xsl:for-each select="licenses/license">
        <xsl:variable name="n" select="name"/>
        <xsl:variable name="f" select="concat(translate($n,' ','-'),'.txt')"/>
        <xsl:value-of select="$f"/>
        <xsl:text>&#xa;</xsl:text>
      </xsl:for-each>
    </xsl:for-each>

  </xsl:template>

</xsl:stylesheet>
