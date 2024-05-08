use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Root {
    #[serde(rename = "Event")]
    pub event: Event,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Event {
    #[serde(rename = "System")]
    pub system: System,
    // #[serde(rename = "EventData", default)] // EventDataがない場合にデフォルト（空）を使用
    // pub event_data: Option<EventData>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct System {
    #[serde(rename = "Provider")]
    pub provider: Provider,
    #[serde(rename = "EventID")]
    pub event_id: EventID,
    #[serde(rename = "Version", default)]
    pub version: Option<u32>,
    #[serde(rename = "Level")]
    pub level: u32,
    #[serde(rename = "Task")]
    pub task: u32,
    #[serde(rename = "Opcode")]
    pub opcode: Option<u32>,
    #[serde(rename = "Keywords")]
    pub keywords: Option<String>,
    #[serde(rename = "TimeCreated")]
    pub time_created: TimeCreated,
    #[serde(rename = "EventRecordID")]
    pub event_record_id: u64,
    #[serde(rename = "Correlation", default)]
    pub correlation: Option<Correlation>,
    #[serde(rename = "Execution")]
    pub execution: Option<Execution>,
    #[serde(rename = "Channel")]
    pub channel: String,
    #[serde(rename = "Computer")]
    pub computer: String,
    #[serde(rename = "Security", default)]
    pub security: Option<Security>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum EventID {
    Simple(u32),
    Complex {
        #[serde(rename = "#attributes")]
        attributes: EventIdAttributes,
        #[serde(rename = "#text")]
        text: Option<u32>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EventIdAttributes {
    #[serde(rename = "Qualifiers")]
    qualifiers: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Provider {
    #[serde(rename = "#attributes")]
    pub attributes: ProviderAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderAttributes {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Guid", default)]
    pub guid: Option<String>,
    #[serde(rename = "EventSourceName", default)]
    pub event_source_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeCreated {
    #[serde(rename = "#attributes")]
    pub attributes: TimeCreatedAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeCreatedAttributes {
    #[serde(rename = "SystemTime")]
    pub system_time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Correlation {
    #[serde(rename = "#attributes")]
    pub attributes: CorrectionAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CorrectionAttributes {
    #[serde(rename = "ActivityID", default)]
    pub activity_id: Option<String>,
    #[serde(rename = "RelatedActivityID", default)]
    pub related_activity_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Execution {
    #[serde(rename = "#attributes")]
    pub attributes: ExecutionAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionAttributes {
    #[serde(rename = "ProcessID")]
    pub process_id: u32,
    #[serde(rename = "ThreadID")]
    pub thread_id: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Security {
    #[serde(rename = "#attributes")]
    pub attributes: SecurityAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SecurityAttributes {
    #[serde(rename = "UserID", default)]
    pub user_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct EventData {
    #[serde(flatten)]
    pub data: Option<HashMap<String, String>>,
}
