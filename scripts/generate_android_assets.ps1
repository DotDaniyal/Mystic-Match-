Add-Type -AssemblyName System.Drawing

function Draw-Crystal {
    param(
        [System.Drawing.Graphics]$g,
        [float]$cx,
        [float]$cy,
        [float]$size
    )

    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Outer atmospheric aura glow
    $auraPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $auraRect = [System.Drawing.RectangleF]::new($cx - $size * 0.9, $cy - $size * 0.9, $size * 1.8, $size * 1.8)
    $auraPath.AddEllipse($auraRect)
    $auraBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($auraPath)
    $auraBrush.CenterColor = [System.Drawing.Color]::FromArgb(140, 113, 56, 200) # #7138C8
    $auraBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 16, 21, 45))
    $g.FillEllipse($auraBrush, $auraRect)
    $auraBrush.Dispose()
    $auraPath.Dispose()

    # Inner cyan radiant glow
    $cyanPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $cyanRect = [System.Drawing.RectangleF]::new($cx - $size * 0.65, $cy - $size * 0.65, $size * 1.3, $size * 1.3)
    $cyanPath.AddEllipse($cyanRect)
    $cyanBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($cyanPath)
    $cyanBrush.CenterColor = [System.Drawing.Color]::FromArgb(160, 57, 213, 232) # #39D5E8
    $cyanBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 33, 18, 56))
    $g.FillEllipse($cyanBrush, $cyanRect)
    $cyanBrush.Dispose()
    $cyanPath.Dispose()

    # Gem coordinates based on center & size
    # Crystal profile: Top peak, upper shoulders, mid waist, lower tip
    $pTop   = [System.Drawing.PointF]::new($cx, $cy - $size * 0.65)
    $pLSh   = [System.Drawing.PointF]::new($cx - $size * 0.38, $cy - $size * 0.35)
    $pRSh   = [System.Drawing.PointF]::new($cx + $size * 0.38, $cy - $size * 0.35)
    $pLMid  = [System.Drawing.PointF]::new($cx - $size * 0.55, $cy + $size * 0.05)
    $pRMid  = [System.Drawing.PointF]::new($cx + $size * 0.55, $cy + $size * 0.05)
    $pBot   = [System.Drawing.PointF]::new($cx, $cy + $size * 0.72)
    $pCenter= [System.Drawing.PointF]::new($cx, $cy - $size * 0.08)

    # Helper to draw filled facet
    $drawFacet = {
        param($points, $c1, $c2)
        $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $path.AddPolygon($points)
        $rect = $path.GetBounds()
        if ($rect.Width -gt 0 -and $rect.Height -gt 0) {
            $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $c1, $c2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
            $g.FillPath($brush, $path)
            $brush.Dispose()
        }
        $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180, 245, 199, 107), [Math]::Max(1.5, $size * 0.025))
        $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawPath($pen, $path)
        $pen.Dispose()
        $path.Dispose()
    }

    # 1. Top facet (Table)
    & $drawFacet @($pTop, $pRSh, $pCenter, $pLSh) `
        ([System.Drawing.Color]::FromArgb(255, 245, 199, 107)) `
        ([System.Drawing.Color]::FromArgb(255, 168, 85, 247))

    # 2. Left shoulder facet
    & $drawFacet @($pTop, $pLSh, $pLMid) `
        ([System.Drawing.Color]::FromArgb(255, 196, 167, 255)) `
        ([System.Drawing.Color]::FromArgb(255, 113, 56, 200))

    # 3. Right shoulder facet
    & $drawFacet @($pTop, $pRSh, $pRMid) `
        ([System.Drawing.Color]::FromArgb(255, 241, 139, 203)) `
        ([System.Drawing.Color]::FromArgb(255, 140, 40, 170))

    # 4. Center-Left mid facet
    & $drawFacet @($pLSh, $pLMid, $pCenter) `
        ([System.Drawing.Color]::FromArgb(255, 57, 213, 232)) `
        ([System.Drawing.Color]::FromArgb(255, 33, 18, 56))

    # 5. Center-Right mid facet
    & $drawFacet @($pRSh, $pRMid, $pCenter) `
        ([System.Drawing.Color]::FromArgb(255, 87, 155, 255)) `
        ([System.Drawing.Color]::FromArgb(255, 113, 56, 200))

    # 6. Bottom-Left lower pavilion
    & $drawFacet @($pLMid, $pBot, $pCenter) `
        ([System.Drawing.Color]::FromArgb(255, 14, 165, 233)) `
        ([System.Drawing.Color]::FromArgb(255, 16, 21, 45))

    # 7. Bottom-Right lower pavilion
    & $drawFacet @($pRMid, $pBot, $pCenter) `
        ([System.Drawing.Color]::FromArgb(255, 168, 85, 247)) `
        ([System.Drawing.Color]::FromArgb(255, 33, 18, 56))

    # Specular Gleam / Sparkle on upper-left
    $spX = $cx - $size * 0.16
    $spY = $cy - $size * 0.28
    $spSize = $size * 0.22
    $spPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(240, 255, 255, 255), [Math]::Max(2.0, $size * 0.03))
    $g.DrawLine($spPen, $spX - $spSize, $spY, $spX + $spSize, $spY)
    $g.DrawLine($spPen, $spX, $spY - $spSize, $spX, $spY + $spSize)
    $spPen.Dispose()
    $g.FillEllipse([System.Drawing.Brushes]::White, $spX - $spSize * 0.25, $spY - $spSize * 0.25, $spSize * 0.5, $spSize * 0.5)
}

function Generate-Icon {
    param([int]$w, [int]$h, [string]$outPath, [bool]$transparentBg = $false)
    $dir = Split-Path -Parent $outPath
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }

    $bmp = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    if (-not $transparentBg) {
        # Rich radial gradient background
        $bgPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $bgRect = [System.Drawing.RectangleF]::new(0, 0, $w, $h)
        $bgPath.AddRectangle($bgRect)
        $bgBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($bgPath)
        $bgBrush.CenterColor = [System.Drawing.Color]::FromArgb(255, 33, 18, 56) # #211238
        $bgBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(255, 16, 21, 45)) # #10152D
        $g.FillRectangle($bgBrush, $bgRect)
        $bgBrush.Dispose()
        $bgPath.Dispose()

        # Rounded corner border for standard icon
        $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(60, 196, 167, 255), [Math]::Max(1.0, $w * 0.02))
        $g.DrawRectangle($pen, 0, 0, $w - 1, $h - 1)
        $pen.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    # Draw centered crystal gem (size slightly padded for adaptive foreground)
    $gemScale = if ($transparentBg) { [Math]::Min($w, $h) * 0.32 } else { [Math]::Min($w, $h) * 0.42 }
    Draw-Crystal -g $g -cx ($w / 2.0) -cy ($h / 2.0) -size $gemScale

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Generate-Splash {
    param([int]$w, [int]$h, [string]$outPath)
    $dir = Split-Path -Parent $outPath
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }

    $bmp = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Deep mystic background
    $bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 16, 21, 45))
    $g.FillRectangle($bgBrush, 0, 0, $w, $h)
    $bgBrush.Dispose()

    # Atmospheric central radial gradient
    $radPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $radRect = [System.Drawing.RectangleF]::new($w * 0.1, $h * 0.15, $w * 0.8, $h * 0.7)
    $radPath.AddEllipse($radRect)
    $radBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($radPath)
    $radBrush.CenterColor = [System.Drawing.Color]::FromArgb(180, 33, 18, 56)
    $radBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 16, 21, 45))
    $g.FillEllipse($radBrush, $radRect)
    $radBrush.Dispose()
    $radPath.Dispose()

    # Ambient light glow behind crystal
    $gemSize = [Math]::Min($w, $h) * 0.22
    $gemCenterY = if ($h -gt $w) { $h * 0.42 } else { $h * 0.38 }

    Draw-Crystal -g $g -cx ($w / 2.0) -cy $gemCenterY -size $gemSize

    # "MYSTIC MATCH" Title Text
    $titleFontSize = [Math]::Max(16.0, [Math]::Min($w, $h) * 0.075)
    $titleFont = [System.Drawing.Font]::new("Georgia", $titleFontSize, [System.Drawing.FontStyle]::Bold)
    $titleText = "MYSTIC MATCH"
    $titleSize = $g.MeasureString($titleText, $titleFont)
    $titleX = ($w - $titleSize.Width) / 2.0
    $titleY = $gemCenterY + $gemSize * 0.85

    # Glowing text shadow
    $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 57, 213, 232))
    $g.DrawString($titleText, $titleFont, $shadowBrush, [float]($titleX + 2), [float]($titleY + 2))
    $shadowBrush.Dispose()

    # Golden text
    $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 245, 199, 107))
    $g.DrawString($titleText, $titleFont, $textBrush, [float]$titleX, [float]$titleY)
    $textBrush.Dispose()
    $titleFont.Dispose()

    # Subtitle "ARCANE PUZZLE ADVENTURE"
    $subFontSize = [Math]::Max(10.0, [Math]::Min($w, $h) * 0.028)
    $subFont = [System.Drawing.Font]::new("Arial", $subFontSize, [System.Drawing.FontStyle]::Bold)
    $subText = "ARCANE PUZZLE ADVENTURE"
    $subSize = $g.MeasureString($subText, $subFont)
    $subX = ($w - $subSize.Width) / 2.0
    $subY = $titleY + $titleSize.Height * 1.1

    $subBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 196, 167, 255))
    $g.DrawString($subText, $subFont, $subBrush, [float]$subX, [float]$subY)
    $subBrush.Dispose()
    $subFont.Dispose()

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$res = "android\app\src\main\res"

Write-Host "Rendering Launcher Icons..."
# Mipmap icons
$densities = @(
    @{ name = "mdpi"; size = 48; fg = 108 },
    @{ name = "hdpi"; size = 72; fg = 162 },
    @{ name = "xhdpi"; size = 96; fg = 216 },
    @{ name = "xxhdpi"; size = 144; fg = 324 },
    @{ name = "xxxhdpi"; size = 192; fg = 432 }
)

foreach ($d in $densities) {
    $folder = "$res\mipmap-$($d.name)"
    Generate-Icon -w $d.size -h $d.size -outPath "$folder\ic_launcher.png" -transparentBg $false
    Generate-Icon -w $d.size -h $d.size -outPath "$folder\ic_launcher_round.png" -transparentBg $false
    Generate-Icon -w $d.fg -h $d.fg -outPath "$folder\ic_launcher_foreground.png" -transparentBg $true
    Write-Host "  Generated $folder icons"
}

Write-Host "Rendering Splash Screens..."
# Splash screens
Generate-Splash -w 480 -h 800 -outPath "$res\drawable\splash.png"
Generate-Splash -w 320 -h 480 -outPath "$res\drawable-port-mdpi\splash.png"
Generate-Splash -w 480 -h 800 -outPath "$res\drawable-port-hdpi\splash.png"
Generate-Splash -w 720 -h 1280 -outPath "$res\drawable-port-xhdpi\splash.png"
Generate-Splash -w 960 -h 1600 -outPath "$res\drawable-port-xxhdpi\splash.png"
Generate-Splash -w 1280 -h 1920 -outPath "$res\drawable-port-xxxhdpi\splash.png"

Generate-Splash -w 480 -h 320 -outPath "$res\drawable-land-mdpi\splash.png"
Generate-Splash -w 800 -h 480 -outPath "$res\drawable-land-hdpi\splash.png"
Generate-Splash -w 1280 -h 720 -outPath "$res\drawable-land-xhdpi\splash.png"
Generate-Splash -w 1600 -h 960 -outPath "$res\drawable-land-xxhdpi\splash.png"
Generate-Splash -w 1920 -h 1280 -outPath "$res\drawable-land-xxxhdpi\splash.png"

Write-Host "All Android Assets Generated Successfully!"
