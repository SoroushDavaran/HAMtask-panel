import { useState } from 'react'
import { Drawer, Slider, Button, Upload, Tooltip, message } from 'antd'
import { BgColorsOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { PRESETS, useUiCustomization } from '../hooks/useUiCustomization'

function BackgroundCustomizer() {
  const [open, setOpen] = useState(false)
  const { settings, setPreset, setBgImage, setBgOpacity, setBgBlur, resetBg } = useUiCustomization()

  const handleUpload = (file) => {
    if (file.size > 4 * 1024 * 1024) {
      message.error('حجم تصویر باید کمتر از ۴ مگابایت باشد')
      return false
    }
    const reader = new FileReader()
    reader.onload = () => setBgImage(reader.result)
    reader.readAsDataURL(file)
    return false
  }

  return (
    <>
      <Tooltip title="شخصی‌سازی ظاهر" placement="left">
        <button className="customize-fab" onClick={() => setOpen(true)} aria-label="شخصی‌سازی ظاهر">
          <BgColorsOutlined />
        </button>
      </Tooltip>

      <Drawer title="شخصی‌سازی ظاهر" placement="left" size={320} open={open} onClose={() => setOpen(false)}>
        <div className="customize-section">
          <h4>رنگ اصلی</h4>
          <div className="swatch-row">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`swatch${settings.preset === key ? ' active' : ''}`}
                style={{ background: preset.accent, color: preset.accent }}
                onClick={() => setPreset(key)}
                title={preset.label}
                aria-label={preset.label}
              />
            ))}
          </div>
        </div>

        <div className="customize-section">
          <h4>پس‌زمینه سفارشی</h4>
          <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} block>
              انتخاب تصویر
            </Button>
          </Upload>

          {settings.bgImage && (
            <>
              <div className="bg-preview" style={{ backgroundImage: `url(${settings.bgImage})` }} />
              <label className="slider-label">شفافیت</label>
              <Slider min={4} max={60} value={settings.bgOpacity} onChange={setBgOpacity} />
              <label className="slider-label">میزان تاری</label>
              <Slider min={0} max={20} value={settings.bgBlur} onChange={setBgBlur} />
              <Button danger block icon={<DeleteOutlined />} onClick={resetBg} style={{ marginTop: 8 }}>
                حذف پس‌زمینه
              </Button>
            </>
          )}
        </div>

        <p className="customize-note">
          این تنظیمات فقط در همین مرورگر شما ذخیره می‌شود و برای بقیه‌ی کاربران این کنسول قابل مشاهده
          نیست.
        </p>
      </Drawer>
    </>
  )
}

export default BackgroundCustomizer
