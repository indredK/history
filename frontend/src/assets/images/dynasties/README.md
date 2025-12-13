# 朝代背景图片

请将每个朝代的背景图片放置在此目录中，图片文件名应与`dynastyUtils.ts`中定义的路径一致：

## 图片列表

- xia.jpg (夏朝)
- shang.jpg (商朝)
- western-zhou.jpg (西周)
- eastern-zhou.jpg (东周)
- qin.jpg (秦朝)
- western-han.jpg (西汉)
- xin.jpg (新朝)
- eastern-han.jpg (东汉)
- three-kingdoms.jpg (三国)
- wei.jpg (魏)
- shu.jpg (蜀)
- wu.jpg (吴)
- western-jin.jpg (西晋)
- eastern-jin.jpg (东晋)
- northern-southern.jpg (南北朝)
- liu-song.jpg (宋)
- southern-qi.jpg (齐)
- liang.jpg (梁)
- chen.jpg (陈)
- sui.jpg (隋朝)
- tang.jpg (唐朝)
- five-dynasties.jpg (五代十国)
- later-liang.jpg (后梁)
- later-tang.jpg (后唐)
- later-jin.jpg (后晋)
- later-han.jpg (后汉)
- later-zhou.jpg (后周)
- northern-song.jpg (北宋)
- southern-song.jpg (南宋)
- yuan.jpg (元朝)
- ming.jpg (明朝)
- qing.jpg (清朝)

## 图片要求

- 建议使用高分辨率图片 (至少1920x1080)
- 图片内容应与对应朝代的历史文化相关
- 图片格式：JPG、PNG均可
- 建议使用对比度适中的图片，以便文字内容清晰可见

## 使用说明

1. 将所有图片下载或创建完成后，放置在此目录中
2. 确保文件名与上述列表完全一致（区分大小写）
3. 重新启动应用即可看到背景图片效果
4. 当您在3D朝代轮中选择不同朝代时，背景图片会自动切换

## 技术实现

背景图片通过以下方式实现：
- 在`dynastyUtils.ts`中为每个朝代定义了背景图片路径
- 在`store.ts`中添加了选中朝代的状态管理
- 在`App.tsx`中根据选中的朝代动态设置背景图片
- 在`EventList.tsx`中设置了内容区域的透明度，确保背景图片可见
- 在`Dynasty3DWheel.tsx`中添加了朝代选择的事件处理
