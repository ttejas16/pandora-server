# Generate a detailed ERD using Graphviz

# Create a new directed graph for ERD
detailed_erd = Digraph('ERD_Detailed', filename='database_erd_detailed', format='png')
detailed_erd.attr(rankdir='LR', size='12')

# Define detailed entities with attributes
detailed_entities = {
    "Users": ["user_id (PK)", "username", "email", "password_hash", "created_at"],
    "Topics": ["topic_id (PK)", "owner_id (FK)", "topic_name", "is_public", "topic_code", "created_at"],
    "TopicMembers": ["topic_id (PK, FK)", "user_id (PK, FK)", "joined_at"],
    "Tests": ["test_id (PK)", "topic_id (FK)", "created_by (FK)", "test_name", "start_time", "end_time", "created_at"],
    "Questions": ["question_id (PK)", "test_id (FK)", "question_text", "created_at"],
    "Options": ["option_id (PK)", "question_id (FK)", "option_text", "is_correct"],
    "UserAttempts": ["attempt_id (PK)", "test_id (FK)", "user_id (FK)", "started_at", "completed_at", "score"],
    "UserAnswers": ["attempt_id (PK, FK)", "question_id (PK, FK)", "selected_option (FK)"]
}

# Add entities to the ERD
for entity, attributes in detailed_entities.items():
    label = f"{entity} | " + " | ".join(attributes)
    detailed_erd.node(entity, shape='record', label="{" + label + "}")

# Define relationships between entities
detailed_relationships = [
    ("Topics", "Users", "owner_id → user_id"),
    ("TopicMembers", "Topics", "topic_id → topic_id"),
    ("TopicMembers", "Users", "user_id → user_id"),
    ("Tests", "Topics", "topic_id → topic_id"),
    ("Tests", "Users", "created_by → user_id"),
    ("Questions", "Tests", "test_id → test_id"),
    ("Options", "Questions", "question_id → question_id"),
    ("UserAttempts", "Tests", "test_id → test_id"),
    ("UserAttempts", "Users", "user_id → user_id"),
    ("UserAnswers", "UserAttempts", "attempt_id → attempt_id"),
    ("UserAnswers", "Questions", "question_id → question_id"),
    ("UserAnswers", "Options", "selected_option → option_id"),
]

# Add relationships to the graph
for src, dst, label in detailed_relationships:
    detailed_erd.edge(src, dst, label)

# Save the ERD as a PNG file
detailed_erd_path = "/database_erd_detailed.png"
detailed_erd.render(detailed_erd_path, format="png", cleanup=True)

detailed_erd_path
