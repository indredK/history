#!/usr/bin/env node

/**
 * Data Validation Script for Chinese Historical Data
 * Validates CSV and GeoJSON data files for completeness and correctness
 * 
 * Usage: node data/scripts/validate_data.js
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const VALIDATION_CONFIG = {
  persons: {
    file: 'data/raw/persons.csv',
    required: ['name', 'birth_year', 'death_year'],
    optional: ['name_en', 'birth_month', 'death_month', 'roles', 'biography', 'source'],
    validators: {
      name: (val) => val && val.length > 0,
      birth_year: (val) => val === '' || !isNaN(parseInt(val)),
      death_year: (val) => val === '' || !isNaN(parseInt(val)),
      birth_month: (val) => val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12),
      death_month: (val) => val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12),
    },
    crossValidators: [
      (row) => {
        if (row.birth_year && row.death_year && row.death_year !== '') {
          const birth = parseInt(row.birth_year);
          const death = parseInt(row.death_year);
          return birth <= death || `Birth year (${birth}) must be <= death year (${death})`;
        }
        return true;
      }
    ]
  },

  events: {
    file: 'data/raw/events.csv',
    required: ['title', 'start_year', 'end_year'],
    optional: ['title_en', 'start_month', 'end_month', 'event_type', 'description', 'locations', 'participants', 'source'],
    validators: {
      title: (val) => val && val.length > 0,
      start_year: (val) => val && !isNaN(parseInt(val)),
      end_year: (val) => val && !isNaN(parseInt(val)),
      start_month: (val) => val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12),
      end_month: (val) => val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12),
    },
    crossValidators: [
      (row) => {
        const start = parseInt(row.start_year);
        const end = parseInt(row.end_year);
        return start <= end || `Start year (${start}) must be <= end year (${end})`;
      }
    ]
  },

  places: {
    file: 'data/raw/places.csv',
    required: ['canonical_name', 'latitude', 'longitude'],
    optional: ['alt_names', 'description', 'source'],
    validators: {
      canonical_name: (val) => val && val.length > 0,
      latitude: (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      },
      longitude: (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      },
    }
  }
};

const GEOJSON_CONFIG = {
  boundaries_tang: 'data/raw/boundaries_tang.geojson',
  boundaries_song: 'data/raw/boundaries_song.geojson'
};

class ValidationReport {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      totalRows: 0,
      validRows: 0
    };
  }

  addError(file, row, message) {
    this.errors.push({ file, row, message });
  }

  addWarning(file, row, message) {
    this.warnings.push({ file, row, message });
  }

  print() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║        数据验证报告 (Data Validation Report)            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log(`📊 统计汇总 (Statistics):`);
    console.log(`  • 检验文件数: ${this.stats.totalFiles}`);
    console.log(`  • 通过文件数: ${this.stats.validFiles}`);
    console.log(`  • 总记录数: ${this.stats.totalRows}`);
    console.log(`  • 有效记录数: ${this.stats.validRows}`);
    console.log(`  • 错误数: ${this.errors.length}`);
    console.log(`  • 警告数: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('❌ 错误 (Errors):');
      this.errors.forEach(err => {
        console.log(`  [${err.file}:${err.row}] ${err.message}`);
      });
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  警告 (Warnings):');
      this.warnings.forEach(warn => {
        console.log(`  [${warn.file}:${warn.row}] ${warn.message}`);
      });
      console.log();
    }

    const status = this.errors.length === 0 ? '✅ 验证通过' : '❌ 验证失败';
    console.log(`\n${status}`);
  }
}

function validateCSV(configKey, config, report) {
  const filePath = path.join(process.cwd(), config.file);
  
  if (!fs.existsSync(filePath)) {
    report.addError(config.file, 0, `文件不存在 (File not found)`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { columns: true });

    report.stats.totalFiles++;
    report.stats.totalRows += records.length;

    let validCount = 0;

    records.forEach((row, index) => {
      let rowValid = true;

      // Check required fields
      for (const field of config.required) {
        if (!row[field] || row[field].trim() === '') {
          report.addError(config.file, index + 2, `必填字段缺失 (Missing required field: ${field})`);
          rowValid = false;
        }
      }

      // Field-level validation
      for (const [field, validator] of Object.entries(config.validators || {})) {
        if (row[field] !== undefined && !validator(row[field])) {
          report.addError(config.file, index + 2, `字段格式不正确 (Invalid ${field}: ${row[field]})`);
          rowValid = false;
        }
      }

      // Cross-field validation
      if (rowValid && config.crossValidators) {
        for (const validator of config.crossValidators) {
          const result = validator(row);
          if (result !== true) {
            report.addError(config.file, index + 2, result);
            rowValid = false;
          }
        }
      }

      if (rowValid) {
        validCount++;
      }
    });

    if (validCount === records.length) {
      report.stats.validFiles++;
      report.stats.validRows += validCount;
      console.log(`✅ ${config.file} - ${records.length} 条记录通过验证`);
    } else {
      console.log(`⚠️  ${config.file} - ${validCount}/${records.length} 条记录通过验证`);
      report.stats.validRows += validCount;
    }

  } catch (error) {
    report.addError(config.file, 0, `文件读取失败 (Failed to read: ${error.message})`);
  }
}

function validateGeoJSON(key, filePath, report) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    report.addError(filePath, 0, `文件不存在 (File not found)`);
    return;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const geojson = JSON.parse(content);

    report.stats.totalFiles++;

    // Validate structure
    if (!geojson.type || geojson.type !== 'FeatureCollection') {
      report.addError(filePath, 0, `无效的 GeoJSON 结构 (Invalid GeoJSON: must be FeatureCollection)`);
      return;
    }

    if (!Array.isArray(geojson.features)) {
      report.addError(filePath, 0, `无效的 features 字段 (Invalid features field)`);
      return;
    }

    let validFeatures = 0;

    geojson.features.forEach((feature, index) => {
      if (feature.type !== 'Feature') {
        report.addWarning(filePath, index + 1, `Feature 类型不正确`);
        return;
      }

      if (!feature.geometry || !feature.geometry.type) {
        report.addError(filePath, index + 1, `缺失 geometry 字段 (Missing geometry)`);
        return;
      }

      if (!feature.properties) {
        report.addWarning(filePath, index + 1, `缺失 properties 字段 (Missing properties)`);
        return;
      }

      validFeatures++;
    });

    if (validFeatures === geojson.features.length) {
      report.stats.validFiles++;
      report.stats.validRows += validFeatures;
      console.log(`✅ ${filePath} - ${validFeatures} 个 features 通过验证`);
    } else {
      console.log(`⚠️  ${filePath} - ${validFeatures}/${geojson.features.length} 个 features 通过验证`);
      report.stats.validRows += validFeatures;
    }

  } catch (error) {
    report.addError(filePath, 0, `文件解析失败 (Failed to parse: ${error.message})`);
  }
}

function main() {
  console.log('🔍 开始数据验证... (Starting data validation...)\n');

  const report = new ValidationReport();

  // Validate CSV files
  for (const [key, config] of Object.entries(VALIDATION_CONFIG)) {
    validateCSV(key, config, report);
  }

  console.log();

  // Validate GeoJSON files
  for (const [key, filePath] of Object.entries(GEOJSON_CONFIG)) {
    validateGeoJSON(key, filePath, report);
  }

  report.print();

  // Exit with appropriate code
  process.exit(report.errors.length > 0 ? 1 : 0);
}

main();
