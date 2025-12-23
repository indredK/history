# Requirements Document

## Introduction

重构前端人物页面（PeoplePage），移除现有的按职业分类展示功能，新增三个功能完整的标签页：历代帝王、明朝人物、清朝人物。每个标签页需要展示详细的历史人物信息，包括基本信息、功绩、失误、历史评价等，并提供搜索、筛选和排序功能。

## Glossary

- **People_Page**: 人物页面主组件，包含三个标签页的容器
- **Emperor_Tab**: 历代帝王标签页，展示从五帝至清末的所有帝王
- **Ming_Tab**: 明朝人物标签页，展示明朝重要政治人物
- **Qing_Tab**: 清朝人物标签页，展示清朝统治者
- **Emperor**: 帝王数据模型，包含姓名、在位时间、年号、朝代、功绩、失误、评价等字段
- **Historical_Figure**: 历史人物数据模型，包含姓名、生卒年、职位、事迹、成就、评价等字段
- **Filter_System**: 筛选系统，支持按朝代、时期、职位等条件筛选
- **Search_System**: 搜索系统，支持按姓名、年号等关键词搜索
- **Sort_System**: 排序系统，支持按时间、姓名等排序

## Requirements

### Requirement 1: 标签页导航系统

**User Story:** As a user, I want to switch between different tabs (历代帝王, 明朝人物, 清朝人物), so that I can browse different categories of historical figures.

#### Acceptance Criteria

1. WHEN the People_Page loads, THE People_Page SHALL display a tab navigation bar with three tabs: "历代帝王", "明朝人物", "清朝人物"
2. WHEN a user clicks on a tab, THE People_Page SHALL switch to display the corresponding content
3. THE People_Page SHALL highlight the currently active tab with visual distinction
4. WHEN the page first loads, THE People_Page SHALL default to showing the "历代帝王" tab
5. THE Tab_Navigation SHALL be responsive and adapt to different screen sizes

### Requirement 2: 历代帝王标签页

**User Story:** As a user, I want to view a comprehensive list of Chinese emperors from the Five Emperors period to the end of Qing Dynasty, so that I can learn about their reign and historical significance.

#### Acceptance Criteria

1. THE Emperor_Tab SHALL display emperors organized by dynasty in chronological order
2. WHEN displaying an emperor, THE Emperor_Tab SHALL show basic information including: name (姓名), reign period (在位时间), era names (年号), and dynasty (朝代)
3. WHEN displaying an emperor, THE Emperor_Tab SHALL show major achievements and historical contributions (主要功绩)
4. WHEN displaying an emperor, THE Emperor_Tab SHALL show major failures and historical controversies (重大失误与争议)
5. WHEN displaying an emperor, THE Emperor_Tab SHALL show historical evaluations with citations from authoritative sources (历史评价)
6. WHEN a user clicks on an emperor card, THE Emperor_Tab SHALL display a detailed modal with complete information
7. THE Emperor_Tab SHALL provide a search function to find emperors by name or era name
8. THE Emperor_Tab SHALL provide filter options by dynasty
9. THE Emperor_Tab SHALL provide sorting options (by reign start year, by dynasty)

### Requirement 3: 明朝人物标签页

**User Story:** As a user, I want to explore important political figures of the Ming Dynasty, so that I can understand their roles in Ming Dynasty history.

#### Acceptance Criteria

1. THE Ming_Tab SHALL display Ming Dynasty political figures organized by time period or political faction
2. WHEN displaying a figure, THE Ming_Tab SHALL show biographical information including: name, birth/death years, positions held
3. WHEN displaying a figure, THE Ming_Tab SHALL show political views and major achievements
4. WHEN displaying a figure, THE Ming_Tab SHALL show their role in major historical events
5. THE Ming_Tab SHALL include various political roles: emperors (皇帝), cabinet ministers (内阁大臣), military generals (将领), and other officials
6. WHEN a user clicks on a figure card, THE Ming_Tab SHALL display a detailed modal with complete information
7. THE Ming_Tab SHALL provide a search function to find figures by name
8. THE Ming_Tab SHALL provide filter options by role type and time period
9. THE Ming_Tab SHALL provide sorting options (by birth year, by name)

### Requirement 4: 清朝人物标签页

**User Story:** As a user, I want to explore Qing Dynasty rulers and their governance, so that I can understand the rise and fall of the Qing Dynasty.

#### Acceptance Criteria

1. THE Qing_Tab SHALL display all Qing Dynasty rulers from Nurhaci to Puyi in chronological order
2. WHEN displaying a ruler, THE Qing_Tab SHALL show basic information including: name, reign period, era names, temple name (庙号)
3. WHEN displaying a ruler, THE Qing_Tab SHALL show major political measures and policies (政治举措)
4. WHEN displaying a ruler, THE Qing_Tab SHALL show major historical events during their reign
5. WHEN displaying a ruler, THE Qing_Tab SHALL show their contribution to or responsibility for the dynasty's rise and fall
6. WHEN a user clicks on a ruler card, THE Qing_Tab SHALL display a detailed modal with complete information
7. THE Qing_Tab SHALL provide a search function to find rulers by name or era name
8. THE Qing_Tab SHALL provide sorting options (by reign start year)

### Requirement 5: 响应式设计

**User Story:** As a user, I want the page to display properly on different devices, so that I can browse historical figures on desktop, tablet, or mobile.

#### Acceptance Criteria

1. THE People_Page SHALL adapt its layout for desktop screens (width >= 1024px) with multi-column card grid
2. THE People_Page SHALL adapt its layout for tablet screens (768px <= width < 1024px) with two-column layout
3. THE People_Page SHALL adapt its layout for mobile screens (width < 768px) with single-column layout
4. THE Tab_Navigation SHALL collapse into a scrollable horizontal list on mobile devices
5. THE Detail_Modal SHALL be full-screen on mobile devices and centered dialog on larger screens
6. THE Filter_System SHALL collapse into a dropdown or drawer on mobile devices

### Requirement 6: 数据加载与错误处理

**User Story:** As a user, I want to see loading states and error messages, so that I know the status of data loading.

#### Acceptance Criteria

1. WHILE data is loading, THE People_Page SHALL display skeleton loading placeholders
2. IF data loading fails, THEN THE People_Page SHALL display an error message with a retry button
3. WHEN data loads successfully, THE People_Page SHALL cache the data to avoid redundant requests
4. THE People_Page SHALL load tab data lazily (only when the tab is first accessed)

### Requirement 7: 数据模型与序列化

**User Story:** As a developer, I want well-defined data models for emperors and historical figures, so that data can be consistently stored and retrieved.

#### Acceptance Criteria

1. THE Emperor data model SHALL include fields: id, name, dynasty, reignStart, reignEnd, eraNames, achievements, failures, evaluations, sources
2. THE Historical_Figure data model SHALL include fields: id, name, birthYear, deathYear, positions, biography, achievements, events, evaluations, sources
3. WHEN storing data to local cache, THE System SHALL serialize objects using JSON format
4. WHEN retrieving cached data, THE System SHALL deserialize JSON and validate against the schema
5. THE Pretty_Printer SHALL format data objects back into valid JSON strings
6. FOR ALL valid data objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
