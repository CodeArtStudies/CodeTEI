<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  xmlns:code="http://codetei.org/ns/code"
  xmlns:meta="http://codetei.org/ns/meta"
  exclude-result-prefixes="tei code meta">

  <!-- root template -->
  <xsl:template match="/tei:TEI">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title"/></title>
        <style>
          pre { background:#111;color:#eee;padding:1em;overflow:auto;}
          .line { display:block; white-space:pre; }
          .note { color:#9cdcfe; font-style:italic; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title"/></h1>
        <xsl:apply-templates select="tei:text/tei:body"/>
      </body>
    </html>
  </xsl:template>

  <!-- render code block -->
  <xsl:template match="code:block">
    <pre>
      <xsl:apply-templates/>
    </pre>
  </xsl:template>

  <!-- render code line with inline highlighting if any meta:tokRange -->
  <xsl:template match="code:line">
    <xsl:variable name="id" select="@xml:id"/>
    <span class="line" id="{$id}">
      <xsl:variable name="text" select="string(.)"/>
      <xsl:value-of select="$text"/>
      <!-- append notes targeting this line -->
      <xsl:for-each select="ancestor::tei:TEI/tei:standOff/meta:note[@target='#{$id}']">
        <span class="note">&#160;■ <xsl:value-of select="normalize-space(p)"/></span>
      </xsl:for-each>
    </span>
  </xsl:template>

  <!-- fallback -->
  <xsl:template match="*|text()"><xsl:apply-templates/></xsl:template>
</xsl:stylesheet>
